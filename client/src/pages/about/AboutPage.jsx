import { useSelector } from 'react-redux'

import { selectCurrentUser, selectIsAuthenticated } from '../../store/authSlice'

export function AboutPage() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const showCandidateFooter = isAuthenticated && user?.role === 'candidate'

  return (
    <main className="about-layout">
      <div className="career-hero about-hero">
        <div className="career-hero-inner about-hero-inner">
          <div>
            <h1 className="about-hero-title">
              Vuman - 20 năm xây dựng giải pháp số tại Việt Nam
            </h1>
            <p className="about-hero-subtitle">
              Hợp tác cùng nhiều đối tác quốc tế, cung cấp production software, ERP và hệ thống doanh nghiệp với chất lượng triển khai thuộc nhóm hàng đầu tại Việt Nam.
            </p>
          </div>
        </div>
      </div>

      <section className="about-section">
        <div className="about-grid about-grid--3">
          <div className="about-card">
            <div className="about-card-title">20 năm thành lập tại Việt Nam</div>
            <div className="about-card-body">
              Kể từ những ngày đầu thành lập, Vuman liên tục mở rộng năng lực sản xuất phần mềm và triển khai giải pháp cho doanh nghiệp.
            </div>
          </div>
          <div className="about-card">
            <div className="about-card-title">Đối tác quốc tế đa dạng</div>
            <div className="about-card-body">
              Chúng tôi hợp tác với nhiều đối tác toàn cầu để đồng hành cùng các dự án production software và tích hợp hệ thống quy mô lớn.
            </div>
          </div>
          <div className="about-card">
            <div className="about-card-title">Định hướng top 1 tại Việt Nam</div>
            <div className="about-card-body">
              Tập trung vào tiêu chuẩn chất lượng, quy trình triển khai và năng lực vận hành để đạt hiệu quả bền vững.
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-two-col">
          <div className="about-card">
            <div className="about-card-title">Năng lực chuyên môn</div>
            <div className="about-card-body">
              Vuman chuyên sâu vào các mảng:
              <ul className="about-bullets">
                <li>Production software: sản xuất và bàn giao giải pháp phần mềm cho hệ thống vận hành thực tế</li>
                <li>ERP: triển khai hệ thống quản trị doanh nghiệp, tối ưu quy trình và dữ liệu</li>
                <li>System: tích hợp hệ thống, mở rộng kiến trúc và đảm bảo khả năng vận hành</li>
              </ul>
            </div>
          </div>
          <div className="about-card">
            <div className="about-card-title">Tư duy triển khai theo chuẩn</div>
            <div className="about-card-body">
              Chúng tôi áp dụng các nguyên tắc rõ ràng cho việc phân tích yêu cầu, thiết kế kiến trúc, kiểm thử và bàn giao. Mục tiêu là giảm rủi ro và tăng chất lượng cho mỗi dự án.
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="about-two-col">
          <div className="about-card">
            <div className="about-card-title">Trụ sở tại Việt Nam</div>
            <div className="about-card-body">
              Tập trung đội ngũ sản xuất phần mềm, triển khai dự án và vận hành giải pháp theo nhu cầu doanh nghiệp trong nước.
            </div>
          </div>
          <div className="about-card">
            <div className="about-card-title">Trụ sở/hiện diện tại nước ngoài</div>
            <div className="about-card-body">
              Đồng hành với các đối tác quốc tế thông qua hợp tác dự án, chia sẻ năng lực và phối hợp triển khai xuyên biên giới.
            </div>
          </div>
        </div>
      </section>

      {showCandidateFooter && (
        <footer className="candidate-footer-follow">
          <div className="candidate-footer-title">Theo dõi chúng tôi</div>
          <div className="candidate-follow-row candidate-follow-row--footer">
            <span className="candidate-follow-icon">X</span>
            <span className="candidate-follow-icon">YouTube</span>
            <span className="candidate-follow-icon">LinkedIn</span>
            <span className="candidate-follow-icon">Facebook</span>
          </div>
          <div className="candidate-footer-links">
            <a
              href="#"
              className="candidate-about-link"
              onClick={(e) => e.preventDefault()}
            >
              Chính sách quyền riêng tư của ứng viên
            </a>
          </div>
          <div className="candidate-footer-copy">
            © {new Date().getFullYear()} Vuman Recruitment Nexus
          </div>
        </footer>
      )}
    </main>
  )
}

