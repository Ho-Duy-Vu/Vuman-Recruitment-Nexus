import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../store/authSlice'

jest.mock('../../api/application.api', () => ({
  submitApplication: jest.fn()
}))

import { ApplyPage } from '../../pages/public/ApplyPage'
import { submitApplication } from '../../api/application.api'

const createTestStore = () =>
  configureStore({ reducer: { auth: authReducer } })

const renderApplyPage = (jobId = 'job123') => {
  const store = createTestStore()
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/apply/${jobId}`]}>
        <Routes>
          <Route path="/apply/:jobId" element={<ApplyPage />} />
          <Route path="/jobs" element={<div>Jobs Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

// helper: fill step 0 required fields (country, city, gender)
const fillStep0 = () => {
  const cityInput = screen.getByPlaceholderText('Hồ Chí Minh')
  fireEvent.change(cityInput, { target: { value: 'Hà Nội' } })

  const selects = Array.from(document.querySelectorAll('select'))
  const countrySelect = selects.find((s) => s.querySelector('option[value="Hoa Kỳ"]'))
  const genderSelect = selects.find((s) => s.querySelector('option[value="Nam"]'))

  if (countrySelect) fireEvent.change(countrySelect, { target: { value: 'Việt Nam' } })
  if (genderSelect) fireEvent.change(genderSelect, { target: { value: 'Nam' } })
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('ApplyPage — Step 1 (Thông tin của tôi)', () => {
  it('should show "Thông tin của tôi" heading on step 1', () => {
    renderApplyPage()
    expect(screen.getByRole('heading', { name: 'Thông tin của tôi' })).toBeInTheDocument()
  })

  it('should NOT proceed without required personal info', () => {
    renderApplyPage()
    fireEvent.click(screen.getByRole('button', { name: 'Lưu và tiếp tục' }))
    expect(screen.getByText(/Vui lòng điền đầy đủ thông tin bắt buộc/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Thông tin của tôi' })).toBeInTheDocument()
  })

  it('should proceed to step 2 after filling required info', () => {
    renderApplyPage()
    fillStep0()
    fireEvent.click(screen.getByRole('button', { name: 'Lưu và tiếp tục' }))
    expect(screen.getByRole('heading', { name: 'Kỹ năng' })).toBeInTheDocument()
  })
})

describe('ApplyPage — Step 2 (Kỹ năng)', () => {
  const goToStep2 = () => {
    renderApplyPage()
    fillStep0()
    fireEvent.click(screen.getByRole('button', { name: 'Lưu và tiếp tục' }))
  }

  it('should show "Kỹ năng" heading on step 2', () => {
    goToStep2()
    expect(screen.getByRole('heading', { name: 'Kỹ năng' })).toBeInTheDocument()
  })
})

describe('ApplyPage — Step 3 (Câu hỏi ứng tuyển / CV)', () => {
  const goToStep3 = () => {
    renderApplyPage()
    fillStep0()
    fireEvent.click(screen.getByRole('button', { name: 'Lưu và tiếp tục' }))
    fireEvent.click(screen.getByRole('button', { name: 'Lưu và tiếp tục' }))
  }

  it('should show CV upload label on step 3', () => {
    goToStep3()
    expect(screen.getByRole('heading', { name: 'Câu hỏi ứng tuyển' })).toBeInTheDocument()
    expect(screen.getByText(/Tải lên CV/)).toBeInTheDocument()
  })

  it('should NOT proceed to step 4 without CV file', () => {
    goToStep3()
    fireEvent.click(screen.getByRole('button', { name: 'Lưu và tiếp tục' }))
    expect(screen.getByText(/Vui lòng tải lên file CV/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Câu hỏi ứng tuyển' })).toBeInTheDocument()
  })
})

describe('ApplyPage — Step 4 (Thông tin tự nguyện)', () => {
  const goToStep4 = () => {
    renderApplyPage()
    fillStep0()
    fireEvent.click(screen.getByRole('button', { name: 'Lưu và tiếp tục' }))
    fireEvent.click(screen.getByRole('button', { name: 'Lưu và tiếp tục' }))
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
    fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu và tiếp tục' }))
  }

  it('should show "Lời nhắn gửi HR" textarea with char counter', () => {
    goToStep4()
    expect(screen.getByText(/Lời nhắn gửi HR/)).toBeInTheDocument()
    expect(screen.getByText('0/500')).toBeInTheDocument()
  })
})

describe('ApplyPage — API errors', () => {
  const fillAndSubmit = async () => {
    renderApplyPage()
    fillStep0()
    fireEvent.click(screen.getByRole('button', { name: 'Lưu và tiếp tục' }))
    fireEvent.click(screen.getByRole('button', { name: 'Lưu và tiếp tục' }))
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
    fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu và tiếp tục' })) // step 3
    fireEvent.click(screen.getByRole('button', { name: 'Lưu và tiếp tục' })) // step 4 review
    fireEvent.click(screen.getByRole('button', { name: 'Nộp hồ sơ' }))
  }

  it('should show "Bạn đã ứng tuyển vị trí này rồi" on 409 response', async () => {
    submitApplication.mockRejectedValueOnce({
      response: { status: 409, data: { message: 'Application already exists' } }
    })
    await fillAndSubmit()
    await waitFor(() => {
      expect(submitApplication).toHaveBeenCalledTimes(1)
    })
    await waitFor(() => {
      expect(screen.getByText('Bạn đã ứng tuyển vị trí này rồi')).toBeInTheDocument()
    })
  })
})
