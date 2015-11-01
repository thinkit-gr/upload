# upload

A simple uploading service for public use. Uploads data to a publicly accessible Azure storage account.
Based on :
- https://code.msdn.microsoft.com/Windows-Azure-Storage-CORS-45e5ce76
- http://gauravmantri.com/2013/02/16/uploading-large-files-in-windows-azure-blob-storage-using-shared-access-signature-html-and-javascript/

Code is available in the gh-pages branch.

To get the Shared Access Signature (placed in the meta tag of index.html) use the following sample code:

```csharp
  //1. Install-Package WindowsAzure.Storage
  //2. Get context account
  var account = CloudStorageAccount.Parse(ConfigurationManager.ConnectionStrings["StorageAccount"].ConnectionString);

  //3. Create a blob client
  var blobClient = account.CreateCloudBlobClient();

  //4. Get a container and create it if not exists
  var container = blobClient.GetContainerReference(containerName);
  container.CreateIfNotExists();

  var sAS = container.GetSharedAccessSignature(new SharedAccessBlobPolicy()
  {
     Permissions = SharedAccessBlobPermissions.Write,
     SharedAccessExpiryTime = DateTime.UtcNow.AddYears(1)
  });

  return sAS;
 ```
 
 To set the Cross Origin use the following sample code:
 
 ```csharp
  //1. Install-Package WindowsAzure.Storage
  //2. Get Storage context
  var account = CloudStorageAccount.Parse(ConfigurationManager.ConnectionStrings["StorageAccount"].ConnectionString);

  //3. Create a blob client
  var blobClient = account.CreateCloudBlobClient();

  // 4. Get the current service properties
  ServiceProperties blobServiceProperties = blobClient.GetServiceProperties();

  //5. Create a new CORS properties configuration
  blobServiceProperties.Cors = new CorsProperties();

  //6. Add CORS rules

  blobServiceProperties.Cors.CorsRules.Add(new CorsRule()
  {
      AllowedHeaders = new List<string>() { "*" },
      AllowedMethods = CorsHttpMethods.Put | CorsHttpMethods.Get | CorsHttpMethods.Head | CorsHttpMethods.Post,
      AllowedOrigins = new List<string>() { "http://localhost:3182" },
      ExposedHeaders = new List<string>() { "*" },
      MaxAgeInSeconds = 1800 // 30 minutes
  });

  blobClient.SetServiceProperties(blobServiceProperties);
 ```