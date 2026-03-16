export const buildScreeningPrompt = (cvText, jobTitle, jobDescription, requiredSkills, messageToHR) => {
  return `Bạn là chuyên gia tuyển dụng. Hãy phân tích mức độ phù hợp của ứng viên với vị trí công việc.

VỊ TRÍ: ${jobTitle}
YÊU CẦU KỸ NĂNG: ${requiredSkills.join(', ')}
MÔ TẢ CÔNG VIỆC: ${jobDescription}

NỘI DUNG CV:
${cvText}

LỜI NHẮN CỦA ỨNG VIÊN: ${messageToHR || 'Không có'}

Hãy trả về KẾT QUẢ PHÂN TÍCH dưới dạng JSON THUẦN TÚY (không có markdown, không có backtick):
{
  "matchingScore": <số từ 0 đến 100>,
  "matchedSkills": ["kỹ năng 1", "kỹ năng 2"],
  "missingSkills": ["kỹ năng thiếu 1"],
  "summary": "Nhận xét ngắn gọn về ứng viên bằng tiếng Việt (2-3 câu)"
}`
}
