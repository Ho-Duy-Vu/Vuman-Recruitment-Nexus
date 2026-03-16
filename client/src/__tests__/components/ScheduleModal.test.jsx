import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScheduleModal } from '../../components/application/ScheduleModal'

const noop = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
})

describe('ScheduleModal — renders Vietnamese fields', () => {
  it('should render all 5 fields with Vietnamese labels', () => {
    render(<ScheduleModal onConfirm={noop} onCancel={noop} />)
    expect(screen.getByText(/Lịch phỏng vấn/)).toBeInTheDocument()
    expect(screen.getByText(/Ngày và giờ phỏng vấn/)).toBeInTheDocument()
    expect(screen.getByText(/Hình thức/)).toBeInTheDocument()
    expect(screen.getByText(/Tên người phỏng vấn/)).toBeInTheDocument()
    expect(screen.getByText(/Ghi chú cho ứng viên/)).toBeInTheDocument()
  })

  it('should render Xác nhận and Hủy buttons', () => {
    render(<ScheduleModal onConfirm={noop} onCancel={noop} />)
    expect(screen.getByRole('button', { name: 'Xác nhận' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Hủy' })).toBeInTheDocument()
  })
})

describe('ScheduleModal — validation', () => {
  it('should show validation error in Vietnamese when datetime is empty and confirm clicked', () => {
    render(<ScheduleModal onConfirm={noop} onCancel={noop} />)
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }))
    expect(screen.getByText(/Vui lòng chọn ngày giờ/)).toBeInTheDocument()
    expect(noop).not.toHaveBeenCalled()
  })
})

describe('ScheduleModal — format label changes', () => {
  it('should show "Link họp" label text when format is Online', async () => {
    render(<ScheduleModal onConfirm={noop} onCancel={noop} />)
    // Default is online
    expect(screen.getByText(/Link phỏng vấn/)).toBeInTheDocument()
  })

  it('should show "Địa điểm" label text when format is Offline', async () => {
    render(<ScheduleModal onConfirm={noop} onCancel={noop} />)
    const offlineRadio = screen.getByDisplayValue('offline')
    fireEvent.click(offlineRadio)
    expect(screen.getByText(/Địa điểm/)).toBeInTheDocument()
  })
})

describe('ScheduleModal — cancel', () => {
  it('should call onCancel when Hủy button is clicked', () => {
    const onCancel = jest.fn()
    render(<ScheduleModal onConfirm={noop} onCancel={onCancel} />)
    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})

describe('ScheduleModal — confirm with valid data', () => {
  it('should call onConfirm with scheduleData when all required fields are filled', async () => {
    const onConfirm = jest.fn()
    render(<ScheduleModal onConfirm={onConfirm} onCancel={noop} />)

    // Fill datetime (use querySelector to avoid ambiguity with multiple empty inputs)
    const datetimeInput = document.querySelector('input[type="datetime-local"]')
    fireEvent.change(datetimeInput, { target: { value: '2026-04-10T10:00' } })

    // Fill location
    const locationInput = screen.getByPlaceholderText(/https:\/\/meet/)
    fireEvent.change(locationInput, { target: { value: 'https://meet.google.com/abc' } })

    // Fill interviewer name
    const interviewerInput = screen.getByPlaceholderText(/Nguyễn Văn A/)
    fireEvent.change(interviewerInput, { target: { value: 'Nguyen Van A' } })

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'online',
        location: 'https://meet.google.com/abc',
        interviewerName: 'Nguyen Van A'
      })
    )
  })
})
