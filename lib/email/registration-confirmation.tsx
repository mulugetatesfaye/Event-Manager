// lib/email/registration-confirmation.tsx
export const RegistrationConfirmationEmail = ({
  userName,
  eventTitle,
  eventDate,
  eventLocation,
  ticketNumber,
}: {
  userName: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  ticketNumber: string
}) => {
  return (
    <div>
      <h1>Registration Confirmed!</h1>
      <p>Hi {userName},</p>
      <p>Your registration for {eventTitle} has been confirmed.</p>
      
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <h2>Event Details</h2>
        <p><strong>Event:</strong> {eventTitle}</p>
        <p><strong>Date:</strong> {eventDate}</p>
        <p><strong>Location:</strong> {eventLocation}</p>
        <p><strong>Ticket Number:</strong> {ticketNumber}</p>
      </div>
      
      <p>Please save this email for your records.</p>
    </div>
  )
}