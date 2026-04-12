using LawFirmAPI.Models.DTOs;
using LawFirmAPI.Models.Entities;
using System.Threading.Tasks;

namespace LawFirmAPI.Services
{
    public class PdfService : IPdfService
    {
        public async Task<byte[]> GenerateBillPdf(BillDto bill, Firm firm)
        {
            // TODO: Implement PDF generation
            await Task.CompletedTask;
            return new byte[0];
        }
    }
}