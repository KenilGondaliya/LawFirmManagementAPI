using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;

namespace LawFirmAPI.Services
{
    public class FileService : IFileService
    {
        private readonly string _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

        public FileService()
        {
            if (!Directory.Exists(_uploadPath))
                Directory.CreateDirectory(_uploadPath);
        }

        public async Task<string> SaveFile(IFormFile file, string subDirectory)
        {
            var uploadDir = Path.Combine(_uploadPath, subDirectory);
            if (!Directory.Exists(uploadDir))
                Directory.CreateDirectory(uploadDir);

            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/uploads/{subDirectory}/{fileName}";
        }

        public async Task<byte[]> GetFile(string filePath)
        {
            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", filePath.TrimStart('/'));
            return await File.ReadAllBytesAsync(fullPath);
        }

        public async Task<string> GetFileContent(string filePath)
        {
            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", filePath.TrimStart('/'));
            return await File.ReadAllTextAsync(fullPath);
        }

        public void DeleteFile(string filePath)
        {
            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", filePath.TrimStart('/'));
            if (File.Exists(fullPath))
                File.Delete(fullPath);
        }
    }
}