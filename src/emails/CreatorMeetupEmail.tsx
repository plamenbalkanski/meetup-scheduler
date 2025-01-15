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
  meetupUrl: string
  meetupTitle: string
  usageCount?: number
  monthlyLimit?: number
}

export function CreatorMeetupEmail({ 
  meetupUrl, 
  meetupTitle,
  usageCount = 0,
  monthlyLimit = 3
}: CreatorMeetupEmailProps) {
  const remainingMeetups = monthlyLimit - usageCount
  const showUpgradeMessage = usageCount > 0

  return (
    <Html>
      <Head />
      <Preview>Your meetup "{meetupTitle}" has been created</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your Meetup is Ready!</Heading>
          
          <Text style={text}>
            Share this link with your participants to collect their availability:
          </Text>
          
          <Link href={meetupUrl} style={link}>
            {meetupUrl}
          </Link>

          {showUpgradeMessage && (
            <div style={upgradeBox}>
              <Text style={upgradeText}>
                {remainingMeetups > 0 ? (
                  `You have ${remainingMeetups} free meetup${remainingMeetups === 1 ? '' : 's'} remaining this month.`
                ) : (
                  "You've used all your free meetups for this month."
                )}
                {' '}
                <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/upgrade`} style={upgradeLink}>
                  Upgrade to Pro for unlimited meetups!
                </Link>
              </Text>
            </div>
          )}
        </Container>
      </Body>
    </Html>
  )
}

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
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  marginBottom: '24px',
}

const text = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '1.5',
  marginBottom: '16px',
}

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
}

const upgradeBox = {
  marginTop: '32px',
  padding: '16px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  borderLeft: '4px solid #2563eb',
}

const upgradeText = {
  color: '#444',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
}

const upgradeLink = {
  color: '#2563eb',
  fontWeight: '600',
  textDecoration: 'underline',
} 