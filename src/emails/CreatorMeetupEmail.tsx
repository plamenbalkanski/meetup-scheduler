import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface CreatorMeetupEmailProps {
  meetupUrl: string
  meetupTitle: string
}

export const CreatorMeetupEmail = ({ meetupUrl, meetupTitle }: CreatorMeetupEmailProps) => (
  <Html>
    <Head />
    <Preview>Your meetup "{meetupTitle}" has been created</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your Meetup is Ready! 🎉</Heading>
        <Text style={text}>
          Your meetup "<strong>{meetupTitle}</strong>" has been created successfully.
        </Text>
        
        <Section style={boxContainer}>
          <Heading as="h2" style={h2}>Important Links</Heading>
          <div style={linkBox}>
            <Text style={linkLabel}>Share this link with your participants:</Text>
            <Button style={button} href={meetupUrl}>
              View Meetup Page
            </Button>
            <Text style={linkText}>
              <Link href={meetupUrl} style={link}>{meetupUrl}</Link>
            </Text>
          </div>
        </Section>
        
        <Section style={infoSection}>
          <Heading as="h2" style={h2}>What's Next?</Heading>
          <Text style={text}>
            1. Share the link with your participants<br />
            2. They'll select their available times<br />
            3. Return to your meetup page to see everyone's availability
          </Text>
        </Section>

        <Text style={footer}>
          Need help? Reply to this email and we'll assist you.
        </Text>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '32px',
  margin: '0 0 20px',
}

const h2 = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0 0 12px',
}

const text = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
}

const boxContainer = {
  margin: '30px 0',
}

const linkBox = {
  background: '#ffffff',
  border: '1px solid #e6e6e6',
  borderRadius: '8px',
  padding: '20px',
}

const linkLabel = {
  color: '#666666',
  fontSize: '14px',
  margin: '0 0 12px',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  margin: '16px 0',
}

const linkText = {
  fontSize: '14px',
  color: '#666666',
  margin: '8px 0 0',
}

const link = {
  color: '#2563eb',
  textDecoration: 'none',
}

const infoSection = {
  marginTop: '32px',
}

const footer = {
  color: '#666666',
  fontSize: '14px',
  fontStyle: 'italic',
  marginTop: '32px',
} 