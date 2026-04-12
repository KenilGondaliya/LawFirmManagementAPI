using System.Collections.Generic;
using System.Threading.Tasks;

namespace LawFirmAPI.Services
{
    public interface IAISummaryService
    {
        Task<DocumentSummaryResult> SummarizeDocument(string content);
    }

    public class DocumentSummaryResult
    {
        public string Summary { get; set; } = string.Empty;
        public List<string> KeyPoints { get; set; } = new();
    }
}