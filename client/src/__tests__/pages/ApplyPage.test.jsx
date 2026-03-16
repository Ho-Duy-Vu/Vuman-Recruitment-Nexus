import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../store/authSlice'

// Mock the application API
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

beforeEach(() => {
  jest.clearAllMocks()
})

describe('ApplyPage — Step 1', () => {
  it('should show "Tải lên CV" heading on step 1', () => {
    renderApplyPage()
    expect(screen.getByText('Tải lên CV')).toBeInTheDocument()
  })

  it('should NOT proceed to step 2 without CV file', () => {
    renderApplyPage()
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }))
    expect(screen.getByText(/Vui lòng tải lên file CV/)).toBeInTheDocument()
    expect(screen.getByText('Tải lên CV')).toBeInTheDocument()
  })

  it('should proceed to step 2 after selecting a CV file', () => {
    renderApplyPage()
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
    fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }))
    expect(screen.getByText('Thông tin cá nhân')).toBeInTheDocument()
  })
})

describe('ApplyPage — Step 2', () => {
  const goToStep2 = () => {
    renderApplyPage()
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
    fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }))
  }

  it('should show Vietnamese field labels on step 2', () => {
    goToStep2()
    expect(screen.getByText(/Quốc gia/)).toBeInTheDocument()
    expect(screen.getByText(/Thành phố/)).toBeInTheDocument()
    expect(screen.getByText(/Giới tính/)).toBeInTheDocument()
  })
})

describe('ApplyPage — Step 3', () => {
  const goToStep3 = () => {
    renderApplyPage()
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
    fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }))
    // Fill step 2
    const inputs = document.querySelectorAll('input[type="text"]')
    fireEvent.change(inputs[0], { target: { value: 'Vietnam' } })
    fireEvent.change(inputs[1], { target: { value: 'Hanoi' } })
    fireEvent.change(inputs[2], { target: { value: 'Male' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }))
  }

  it('should show "Nguồn biết đến" with Vietnamese source options', () => {
    goToStep3()
    expect(screen.getByText('Nguồn biết đến')).toBeInTheDocument()
    expect(screen.getByDisplayValue('LinkedIn')).toBeInTheDocument()
  })
})

describe('ApplyPage — Step 4', () => {
  const goToStep4 = () => {
    renderApplyPage()
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
    fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }))
    const inputs = document.querySelectorAll('input[type="text"]')
    fireEvent.change(inputs[0], { target: { value: 'Vietnam' } })
    fireEvent.change(inputs[1], { target: { value: 'Hanoi' } })
    fireEvent.change(inputs[2], { target: { value: 'Male' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }))
  }

  it('should show "Lời nhắn gửi HR" textarea with char counter', () => {
    goToStep4()
    expect(screen.getByText(/Lời nhắn gửi HR/)).toBeInTheDocument()
    expect(screen.getByText(/0\/500 ký tự/)).toBeInTheDocument()
  })
})

describe('ApplyPage — API errors', () => {
  const fillAndSubmit = async () => {
    renderApplyPage()
    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
    fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }))
    const inputs = document.querySelectorAll('input[type="text"]')
    fireEvent.change(inputs[0], { target: { value: 'Vietnam' } })
    fireEvent.change(inputs[1], { target: { value: 'Hanoi' } })
    fireEvent.change(inputs[2], { target: { value: 'Male' } })
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }))
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục' }))
    fireEvent.click(screen.getByRole('button', { name: 'Nộp hồ sơ' }))
  }

  it('should show "Bạn đã ứng tuyển vị trí này rồi" on 409 response', async () => {
    submitApplication.mockRejectedValueOnce({
      response: { status: 409, data: { message: 'Application already exists' } }
    })

    await fillAndSubmit()

    await waitFor(() => {
      expect(screen.getByText('Bạn đã ứng tuyển vị trí này rồi')).toBeInTheDocument()
    })
  })
})
