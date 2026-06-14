// Services/FileService.cs

using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

namespace LawFirmAPI.Services
{
    public class FileService : IFileService
    {
        public async Task<string> SaveFile(IFormFile file, string subDirectory)
        {
            // ✅ Create directory if not exists
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", subDirectory);
            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }
            
            // ✅ Generate unique filename with original extension
            var extension = Path.GetExtension(file.FileName);
            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadPath, fileName);
            
            // ✅ Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            
            // ✅ Return relative path (will be combined with base URL in controller)
            return $"/uploads/{subDirectory}/{fileName}";
        }

        public void DeleteFile(string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl)) return;
            
            try
            {
                // Extract relative path from URL
                var relativePath = fileUrl;
                if (fileUrl.StartsWith("http"))
                {
                    var uri = new Uri(fileUrl);
                    relativePath = uri.AbsolutePath;
                }
                
                // Convert to physical path
                var physicalPath = Path.Combine(Directory.GetCurrentDirectory(), relativePath.TrimStart('/'));
                
                if (File.Exists(physicalPath))
                {
                    File.Delete(physicalPath);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting file: {ex.Message}");
            }
        }

        // Returns raw bytes of the file for the given file URL (relative or absolute URL)
        public async Task<byte[]> GetFile(string fileUrl)
        {
            if (string.IsNullOrEmpty(fileUrl)) return Array.Empty<byte>();

            var relativePath = fileUrl;
            if (fileUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    var uri = new Uri(fileUrl);
                    relativePath = uri.AbsolutePath;
                }
                catch
                {
                    // ignore and treat as relative
                }
            }

            var physicalPath = Path.Combine(Directory.GetCurrentDirectory(), relativePath.TrimStart('/'));
            if (!File.Exists(physicalPath)) return Array.Empty<byte>();

            return await File.ReadAllBytesAsync(physicalPath);
        }

        // Returns base64-encoded content of the file for the given file URL (relative or absolute URL)
        public async Task<string> GetFileContent(string fileUrl)
        {
            var bytes = await GetFile(fileUrl);
            if (bytes == null || bytes.Length == 0) return string.Empty;
            return Convert.ToBase64String(bytes);
        }
    }
}