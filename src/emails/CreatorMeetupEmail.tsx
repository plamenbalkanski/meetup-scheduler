import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface CreatorMeetupEmailProps {
  id: string;
  title: string;
}

export function CreatorMeetupEmail({ id, title }: CreatorMeetupEmailProps) {
  const meetupUrl = `https://meetup-scheduler.onrender.com/meetup/${id}`

  return (
    <Html>
      <Head />
      <Preview>Your meetup "{title}" has been created</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your Meetup is Ready! 🎉</Heading>
          
          <Text style={text}>
            Great! Your meetup "<strong>{title}</strong>" has been created successfully.
          </Text>

          <Text style={text}>
            Share this link with your participants to collect their availability:
          </Text>
          
          <Link href={meetupUrl} style={link}>
            {meetupUrl}
          </Link>

          <Text style={footer}>
            Need help? Reply to this email and we'll be happy to assist you.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  padding: '30px',
}

const container = {
  margin: '0 auto',
  padding: '20px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  maxWidth: '560px',
  border: '1px solid #eaeaea',
}

const h1 = {
  color: '#111',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.5',
  marginBottom: '16px',
}

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
  display: 'block',
  marginBottom: '16px',
}

const footer = {
  color: '#666',
  fontSize: '14px',
  marginTop: '32px',
  textAlign: 'center' as const,
  fontStyle: 'italic',
} 