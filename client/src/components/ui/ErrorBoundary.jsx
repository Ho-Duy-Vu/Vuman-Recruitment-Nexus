import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  handleRetry = () => {
    // Reset UI first, then reload to guarantee clean state.
    this.setState({ error: null })
    if (this.props.onRetry) {
      this.props.onRetry()
      return
    }
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <div className="ui-error-boundary">
          <div className="ui-error-boundary-card">
            <div className="ui-error-boundary-title">Đã xảy ra lỗi</div>
            <div className="ui-error-boundary-desc">
              Vui lòng thử lại sau hoặc tải lại trang.
            </div>
            <button type="button" className="btn btn-primary ui-error-boundary-retry" onClick={this.handleRetry}>
              Tải lại
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

