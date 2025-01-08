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

interface MeetupInviteProps {
  meetupUrl: string
  meetupTitle: string
}

export const MeetupInvite = ({ meetupUrl, meetupTitle }: MeetupInviteProps) => (
  <Html>
    <Head />
    <Preview>You've been invited to select your availability</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Meeting Availability Request</Heading>
        <Text style={text}>
          You've been invited to select your availability for: {meetupTitle}
        </Text>
        <Section style={buttonContainer}>
          <Button
            pX={20}
            pY={12}
            style={button}
            href={meetupUrl}
          >
            Select Your Availability
          </Button>
        </Section>
        <Text style={footer}>
          Or copy this link: <Link href={meetupUrl}>{meetupUrl}</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const h1 = {
  color: '#2563eb',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
}

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px',
}

const buttonContainer = {
  margin: '24px 0',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
}

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
} 