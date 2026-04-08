import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import { selectCurrentUser, selectIsAuthenticated } from '../../store/authSlice'
import company1 from '../../assets/company-1.jpg'
import company2 from '../../assets/company-2.jpg'
import company3 from '../../assets/company-3.jpg'
import company4 from '../../assets/company-4.jpg'

const LIFE_GALLERY = [
  {
    src: company4,
    alt: 'Không gian sự kiện công nghệ trong nhà — NASA Space Apps Challenge TP.HCM',
    kicker: 'Sự kiện',
    title: 'Không gian sự kiện & cộng đồng',
    body: 'Chúng tôi đồng hành các sự kiện công nghệ quy mô lớn, nơi đội ngũ và cộng đồng học hỏi, thử thách và sáng tạo cùng nhau.'
  },
  {
    src: company1,
    alt: 'Đội ngũ tham gia hackathon — môi trường làm việc nhóm chuyên nghiệp',
    kicker: 'Hackathon',
    title: 'Đổi mới qua từng dòng code',
    body: 'Hackathon và cuộc thi công nghệ là cơ hội để kỹ sư Vuman thử nghiệm ý tưởng, phối hợp đa vai và bứt phá trong thời gian ngắn.'
  },
  {
    src: company2,
    alt: 'Đội ngũ tại sự kiện NASA Space Apps — tinh thần đồng đội',
    kicker: 'Đồng đội',
    title: 'Con người là trung tâm',
    body: 'Từ phòng lab đến sân chơi công nghệ ngoài trời, chúng tôi coi trọng kết nối, chia sẻ và niềm vui trong công việc.'
  },
  {
    src: company3,
    alt: 'Ghi nhận thành tích tại cuộc thi CoverGo AI Hackathon',
    kicker: 'Ghi nhận',
    title: 'Giải thưởng & thành tựu',
    body: 'Thành quả tại các cuộc thi và chương trình đối tác phản ánh cam kết về chất lượng kỹ thuật và tinh thần học hỏi không ngừng.'
  }
]

const PRODUCTION_LINES = [
  {
    title: 'Production software',
    body: 'Thiết kế, phát triển và bàn giao phần mềm vận hành thực tế: chuẩn hóa pipeline, kiểm thử và triển khai bền vững cho doanh nghiệp.'
  },
  {
    title: 'ERP & hệ thống quản trị',
    body: 'Giải pháp quy trình, dữ liệu và báo cáo giúp HR, vận hành và lãnh đạo ra quyết định trên một nền tảng thống nhất.'
  },
  {
    title: 'Nền tảng tuyển dụng (ATS)',
    body: 'Vuman Recruitment Nexus — career site, pipeline Kanban, lịch phỏng vấn và trải nghiệm ứng viên được đầu tư như một sản phẩm production.'
  },
  {
    title: 'Tích hợp & mở rộng hệ thống',
    body: 'API, bảo mật tầng HTTP, hàng đợi và realtime: kiến trúc mở để kết nối với hệ sinh thái kỹ thuật hiện có.'
  }
]

export function AboutPage() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const showCandidateFooter = isAuthenticated && user?.role === 'candidate'

  return (
    <main className="about-layout about-life">
      <header className="life-hero">
        <div className="life-hero-inner">
          <p className="life-hero-eyebrow">Life at VUMAN</p>
          <h1 className="life-hero-title">Cuộc sống tại Vuman</h1>
          <p className="life-hero-lead">
            Nơi công nghệ gặp con người: học hỏi liên tục, thử thách tại các sự kiện lớn, và đóng góp vào các sản phẩm thật — phục vụ khách hàng trong nước và đối tác quốc tế.
          </p>
          <div className="life-hero-actions">
            <Link to="/jobs" className="btn btn-primary life-hero-cta">
              Khám phá cơ hội nghề nghiệp
            </Link>
          </div>
        </div>
      </header>

      <section className="life-section" aria-labelledby="life-values-heading">
        <h2 id="life-values-heading" className="life-section-title">
          Vuman qua các con số & cam kết
        </h2>
        <p className="life-section-intro">
          Hơn hai thập kỷ xây dựng giải pháp số tại Việt Nam, hợp tác đa dạng đối tác và hướng tới tiêu chuẩn triển khai hàng đầu.
        </p>
        <div className="life-stats">
          <div className="life-stat-card">
            <div className="life-stat-value">20+</div>
            <div className="life-stat-label">năm hình thành & phát triển</div>
          </div>
          <div className="life-stat-card">
            <div className="life-stat-value">Global</div>
            <div className="life-stat-label">đối tác & dự án xuyên biên giới</div>
          </div>
          <div className="life-stat-card">
            <div className="life-stat-value">Top tier</div>
            <div className="life-stat-label">định hướng chất lượng triển khai</div>
          </div>
        </div>
      </section>

      <section className="life-section" aria-labelledby="life-gallery-heading">
        <h2 id="life-gallery-heading" className="life-section-title">
          Hoạt động & giải thưởng
        </h2>
        <p className="life-section-intro">
          Một phần hành trình của chúng tôi qua các sự kiện công nghệ, hackathon và các dấu mốc được ghi nhận — nơi đội ngũ được truyền cảm hứng và thử thách bản thân.
        </p>
        <div className="life-gallery">
          {LIFE_GALLERY.map((item, i) => (
            <article key={i} className="life-gallery-card">
              <div className="life-gallery-media">
                <img src={item.src} alt={item.alt} loading={i < 2 ? 'eager' : 'lazy'} />
              </div>
              <div className="life-gallery-body">
                <span className="life-gallery-kicker">{item.kicker}</span>
                <h3 className="life-gallery-title">{item.title}</h3>
                <p className="life-gallery-text">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="life-section life-section--muted" aria-labelledby="life-prod-heading">
        <h2 id="life-prod-heading" className="life-section-title">
          Sản phẩm & production công ty
        </h2>
        <p className="life-section-intro">
          Công việc hằng ngày của kỹ sư Vuman là shipping: từ mã nguồn đến hệ thống vận hành ổn định cho khách hàng.
        </p>
        <div className="life-prod-grid">
          {PRODUCTION_LINES.map((row) => (
            <div key={row.title} className="life-prod-card">
              <h3 className="life-prod-title">{row.title}</h3>
              <p className="life-prod-body">{row.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="life-section" aria-labelledby="life-expertise-heading">
        <h2 id="life-expertise-heading" className="life-section-title">
          Năng lực chuyên môn
        </h2>
        <div className="about-two-col life-expertise-row">
          <div className="about-card life-flat-card">
            <div className="about-card-title">Trọng tâm kỹ thuật</div>
            <div className="about-card-body">
              <ul className="about-bullets">
                <li>Production software & kiến trúc bền vững</li>
                <li>ERP & quy trình doanh nghiệp</li>
                <li>Tích hợp hệ thống, API và bảo mật tầng dịch vụ</li>
              </ul>
            </div>
          </div>
          <div className="about-card life-flat-card">
            <div className="about-card-title">Tư duy triển khai</div>
            <div className="about-card-body">
              Phân tích yêu cầu rõ ràng, thiết kế có kiểm soát, kiểm thử và bàn giao minh bạch — giảm rủi ro và tối đa giá trị cho mỗi bước release.
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
            <a href="#" className="candidate-about-link" onClick={(e) => e.preventDefault()}>
              Chính sách quyền riêng tư của ứng viên
            </a>
          </div>
          <div className="candidate-footer-copy">© {new Date().getFullYear()} Vuman Recruitment Nexus</div>
        </footer>
      )}
    </main>
  )
}
