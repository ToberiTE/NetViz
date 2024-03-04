using System.Diagnostics;
using Server;
using Microsoft.AspNetCore.Http.Json;
using System.Xml.Linq;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
});

var app = builder.Build();

if (builder.Environment.IsDevelopment())
{
    app.UseCors(policy =>
           policy.WithOrigins("http://localhost:8080")
    );
}
else
{
    app.UseMiddleware<ValidateOriginMiddleware>();
    app.UseCors(policy =>
           policy.WithOrigins("https://vision-client.azurewebsites.net")
    );
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapGet("/scan", async (string? path, string flag, string target, string timing, CancellationToken cancellationToken) =>
{
    try
    {
        var devices = await StartNmapScan(path, flag, target, timing, cancellationToken);
        return Results.Ok(devices);
    }
    catch (ScanException ex)
    {
        return Results.BadRequest(new { Error = ex.Message, ex.ErrorOutput });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

app.Run();

static async Task<List<DeviceModel>> StartNmapScan(string? path, string flag, string target, string timing, CancellationToken cancellationToken)
{
    string decodedTarget = Uri.UnescapeDataString(target);
    string nmapPath = path ?? @"C:\Program Files (x86)\Nmap\nmap.exe"; // syspath or executable.
    string outputFile = "nmap_output.xml";
    string nmapArguments = $"{flag} {decodedTarget} {timing} -oX {outputFile}"; // Nmap command options.

    List<DeviceModel> devices = [];

    try
    {
        using (Process process = new())
        {
            process.StartInfo.FileName = nmapPath;
            process.StartInfo.Arguments = nmapArguments;
            process.StartInfo.UseShellExecute = false;
            process.StartInfo.RedirectStandardOutput = true;
            process.StartInfo.RedirectStandardError = true;
            process.Start();

            using (var registration = cancellationToken.Register(process.Kill))
            {
                await process.WaitForExitAsync(cancellationToken);
            }

            if (process.ExitCode != 0)
            {
                // Handle non-zero exit code.
                string errorOutput = await process.StandardError.ReadToEndAsync(cancellationToken);
                throw new ScanException("Scan failed.", errorOutput);
            }
        }

        XDocument xdoc = XDocument.Load(outputFile);

        foreach (XElement host in xdoc.Descendants("host"))
        {
            var statusElement = host.Element("status");
            var status = statusElement?.Attribute("state")?.Value;

            // Get the hostname
            var hostnamesElement = host.Element("hostnames");
            var hostname = hostnamesElement?.Elements("hostname")
                                           .FirstOrDefault()
                                           ?.Attribute("name")?.Value;

            // Get the IP, MAC, Vendor and Ports.
            var addresses = host.Elements("address");
            var ipAddress = addresses.FirstOrDefault(a => a.Attribute("addrtype")?.Value == "ipv4")?.Attribute("addr")?.Value;
            var macAddress = addresses.FirstOrDefault(a => a.Attribute("addrtype")?.Value == "mac")?.Attribute("addr")?.Value;
            var vendor = addresses.FirstOrDefault(a => a.Attribute("addrtype")?.Value == "mac")?.Attribute("vendor")?.Value;

            var ports = host.Descendants("ports").Descendants("port")
                .Select(port => new PortInfo
                {
                    PortNumber = (int?)port.Attribute("portid"),
                    Protocol = (string?)port.Attribute("protocol"),
                    State = port.Element("state")?.Attribute("state")?.Value,
                    ServiceName = port.Element("service")?.Attribute("name")?.Value,
                }).ToList();

            DeviceModel device = new()
            {
                Hostname = hostname,
                IpAddress = ipAddress,
                MACAddress = macAddress,
                Vendor = vendor,
                Status = status,
                OpenPorts = ports,
            };

            devices.Add(device);
        }
    }
    finally
    {
        // Delete the XML file after parsing or on exception.
        if (File.Exists(outputFile))
        {
            File.Delete(outputFile);
        }
    }
    return devices;
}

record DeviceModel
{
    public string? Hostname { get; init; }
    public string? IpAddress { get; init; }
    public string? MACAddress { get; init; }
    public string? Vendor { get; init; }
    public string? Status { get; init; }
    public List<PortInfo>? OpenPorts { get; init; }
}
record PortInfo
{
    public int? PortNumber { get; init; }
    public string? Protocol { get; init; }
    public string? ServiceName { get; init; }
    public string? State { get; init; }
}
class ScanException(string message, string errorOutput) : Exception(message)
{
    public string ErrorOutput { get; } = errorOutput;
}