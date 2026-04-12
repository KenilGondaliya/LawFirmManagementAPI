using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace LawFirmAPI.Services
{
    public interface IFileService
    {
        Task<string> SaveFile(IFormFile file, string subDirectory);
        Task<byte[]> GetFile(string filePath);
        Task<string> GetFileContent(string filePath);
        void DeleteFile(string filePath);
    }
}