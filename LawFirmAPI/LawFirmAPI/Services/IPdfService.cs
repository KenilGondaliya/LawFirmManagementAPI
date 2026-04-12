using LawFirmAPI.Models.DTOs;
using LawFirmAPI.Models.Entities;
using System.Threading.Tasks;

namespace LawFirmAPI.Services
{
    public interface IPdfService
    {
        Task<byte[]> GenerateBillPdf(BillDto bill, Firm firm);
    }
}