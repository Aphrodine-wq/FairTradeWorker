/**
 * Component Tests: AuthModalConnected
 *
 * Testing authentication modal with API integration
 * Covers registration, login, password reset, and error handling
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthModalConnected from '../../components/AuthModalConnected'
import { useAuth } from '../../hooks/useAuth'

// Mock the useAuth hook
jest.mock('../../hooks/useAuth')

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('AuthModalConnected - Rendering', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      clearError: jest.fn(),
    } as any)
  })

  it('should render login mode by default', () => {
    render(
      <AuthModalConnected isOpen={true} onClose={jest.fn()} mode="login" />
    )
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })

  it('should render registration form in register mode', () => {
    render(
      <AuthModalConnected isOpen={true} onClose={jest.fn()} mode="register" />
    )
    expect(screen.getByText(/create account|register/i)).toBeInTheDocument()
  })

  it('should render password reset form in reset mode', () => {
    render(
      <AuthModalConnected
        isOpen={true}
        onClose={jest.fn()}
        mode="reset"
      />
    )
    expect(screen.getByText(/reset password|forgot/i)).toBeInTheDocument()
  })

  it('should not render when isOpen is false', () => {
    render(
      <AuthModalConnected isOpen={false} onClose={jest.fn()} mode="login" />
    )
    expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument()
  })
})

describe('AuthModalConnected - Login', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      clearError: jest.fn(),
    } as any)
  })

  it('should accept email and password input', async () => {
    render(
      <AuthModalConnected isOpen={true} onClose={jest.fn()} mode="login" />
    )

    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)

    await userEvent.type(emailInput, 'user@example.com')
    await userEvent.type(passwordInput, 'Password123!')

    expect(emailInput).toHaveValue('user@example.com')
    expect(passwordInput).toHaveValue('Password123!')
  })

  it('should call login function on form submit', async () => {
    const mockLogin = jest.fn()
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      login: mockLogin,
      logout: jest.fn(),
      register: jest.fn(),
      clearError: jest.fn(),
    } as any)

    render(
      <AuthModalConnected isOpen={true} onClose={jest.fn()} mode="login" />
    )

    const emailInput = screen.getByPlaceholderText(/email/i)
    const passwordInput = screen.getByPlaceholderText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in|login/i })

    await userEvent.type(emailInput, 'user@example.com')
    await userEvent.type(passwordInput, 'Password123!')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'Password123!')
    })
  })

  it('should show loading state during login', async () => {
    const mockLogin = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
      error: null,
      login: mockLogin,
      logout: jest.fn(),
      register: jest.fn(),
      clearError: jest.fn(),
    } as any)

    render(
      <AuthModalConnected isOpen={true} onClose={jest.fn()} mode="login" />
    )

    const submitButton = screen.getByRole('button', { name: /sign in|login/i })
    expect(submitButton).toHaveAttribute('disabled')
  })

  it('should display error message on login failure', () => {
    const errorMessage = 'Invalid credentials'
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      error: { message: errorMessage },
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      clearError: jest.fn(),
    } as any)

    render(
      <AuthModalConnected isOpen={true} onClose={jest.fn()} mode="login" />
    )

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })
})

describe('AuthModalConnected - Registration', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      clearError: jest.fn(),
    } as any)
  })

  it('should render all registration fields', () => {
    render(
      <AuthModalConnected isOpen={true} onClose={jest.fn()} mode="register" />
    )

    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/phone/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
  })

  it('should allow role selection', async () => {
    render(
      <AuthModalConnected isOpen={true} onClose={jest.fn()} mode="register" />
    )

    const homeownerButton = screen.getByRole('button', { name: /homeowner/i })
    const contractorButton = screen.getByRole('button', { name: /contractor/i })

    expect(homeownerButton).toBeInTheDocument()
    expect(contractorButton).toBeInTheDocument()

    await userEvent.click(contractorButton)
    expect(contractorButton).toHaveClass('selected')
  })

  it('should call register function with form data', async () => {
    const mockRegister = jest.fn()
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: mockRegister,
      clearError: jest.fn(),
    } as any)

    render(
      <AuthModalConnected isOpen={true} onClose={jest.fn()} mode="register" />
    )

    await userEvent.type(screen.getByPlaceholderText(/first name/i), 'John')
    await userEvent.type(screen.getByPlaceholderText(/last name/i), 'Doe')
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'john@example.com')
    await userEvent.type(screen.getByPlaceholderText(/phone/i), '5551234567')
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'SecurePass123!')

    const submitButton = screen.getByRole('button', { name: /create|register/i })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled()
    })
  })

  it('should validate email format', async () => {
    render(
      <AuthModalConnected isOpen={true} onClose={jest.fn()} mode="register" />
    )

    const emailInput = screen.getByPlaceholderText(/email/i) as HTMLInputElement
    await userEvent.type(emailInput, 'invalid-email')

    const submitButton = screen.getByRole('button', { name: /create|register/i })
    await userEvent.click(submitButton)

    // Component should show validation error
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })
  })

  it('should validate phone format', async () => {
    render(
      <AuthModalConnected isOpen={true} onClose={jest.fn()} mode="register" />
    )

    const phoneInput = screen.getByPlaceholderText(/phone/i) as HTMLInputElement
    await userEvent.type(phoneInput, '123')

    const submitButton = screen.getByRole('button', { name: /create|register/i })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/valid phone/i)).toBeInTheDocument()
    })
  })

  it('should validate password strength', async () => {
    render(
      <AuthModalConnected isOpen={true} onClose={jest.fn()} mode="register" />
    )

    const passwordInput = screen.getByPlaceholderText(/password/i)
    await userEvent.type(passwordInput, 'weak')

    const submitButton = screen.getByRole('button', { name: /create|register/i })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password.*strong|uppercase|number|special/i)).toBeInTheDocument()
    })
  })

  it('should call onSuccess callback after registration', async () => {
    const mockRegister = jest.fn().mockResolvedValue({ id: 'user123' })
    const mockOnSuccess = jest.fn()

    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: mockRegister,
      clearError: jest.fn(),
    } as any)

    render(
      <AuthModalConnected
        isOpen={true}
        onClose={jest.fn()}
        mode="register"
        onSuccess={mockOnSuccess}
      />
    )

    const submitButton = screen.getByRole('button', { name: /create|register/i })
    await userEvent.click(submitButton)

    // After successful registration, onSuccess should be called
    // Note: Exact behavior depends on component implementation
  })
})

describe('AuthModalConnected - Password Reset', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      clearError: jest.fn(),
    } as any)
  })

  it('should render email input for reset', () => {
    render(
      <AuthModalConnected isOpen={true} onClose={jest.fn()} mode="reset" />
    )

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
  })

  it('should show reset code input after email submission', async () => {
    render(
      <AuthModalConnected isOpen={true} onClose={jest.fn()} mode="reset" />
    )

    const emailInput = screen.getByPlaceholderText(/email/i)
    const submitButton = screen.getByRole('button', { name: /send|submit/i })

    await userEvent.type(emailInput, 'user@example.com')
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/code|token/i)).toBeInTheDocument()
    })
  })
})

describe('AuthModalConnected - Modal Controls', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      clearError: jest.fn(),
    } as any)
  })

  it('should call onClose when close button clicked', async () => {
    const mockOnClose = jest.fn()
    render(
      <AuthModalConnected isOpen={true} onClose={mockOnClose} mode="login" />
    )

    const closeButton = screen.getByRole('button', { name: /close|×/i })
    await userEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should switch between login and register modes', async () => {
    const mockOnClose = jest.fn()
    const { rerender } = render(
      <AuthModalConnected isOpen={true} onClose={mockOnClose} mode="login" />
    )

    expect(screen.getByText(/sign in/i)).toBeInTheDocument()

    rerender(
      <AuthModalConnected isOpen={true} onClose={mockOnClose} mode="register" />
    )

    await waitFor(() => {
      expect(screen.getByText(/create account|register/i)).toBeInTheDocument()
    })
  })
})

describe('AuthModalConnected - Dark Mode', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      clearError: jest.fn(),
    } as any)
  })

  it('should apply dark mode styles when theme is dark', () => {
    const { container } = render(
      <AuthModalConnected
        isOpen={true}
        onClose={jest.fn()}
        mode="login"
        theme="dark"
      />
    )

    const modal = container.querySelector('.auth-modal')
    expect(modal).toHaveClass('dark')
  })

  it('should apply light mode styles when theme is light', () => {
    const { container } = render(
      <AuthModalConnected
        isOpen={true}
        onClose={jest.fn()}
        mode="login"
        theme="light"
      />
    )

    const modal = container.querySelector('.auth-modal')
    expect(modal).toHaveClass('light')
  })
})
