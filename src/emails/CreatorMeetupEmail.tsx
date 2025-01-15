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
  startDate: string
  endDate: string
  useTimeRanges: boolean
  startTime?: string
  endTime?: string
}

export function CreatorMeetupEmail({ 
  meetupUrl, 
  meetupTitle,
  usageCount = 0,
  monthlyLimit = 3,
  startDate,
  endDate,
  useTimeRanges,
  startTime,
  endTime
}: CreatorMeetupEmailProps) {
  const remainingMeetups = monthlyLimit - usageCount
  const showUpgradeMessage = usageCount > 0

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Html>
      <Head />
      <Preview>Your meetup "{meetupTitle}" has been created</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your Meetup is Ready! 🎉</Heading>
          
          <Text style={text}>
            Great! Your meetup "<strong>{meetupTitle}</strong>" has been created successfully.
          </Text>

          <div style={detailsBox}>
            <Text style={detailsTitle}>Meetup Details:</Text>
            <Text style={detailsText}>
              📅 Dates: {formatDate(startDate)} to {formatDate(endDate)}
              {useTimeRanges && startTime && endTime && (
                <><br />⏰ Time Range: {startTime} to {endTime}</>
              )}
            </Text>
          </div>

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
                  `⭐️ You have ${remainingMeetups} free meetup${remainingMeetups === 1 ? '' : 's'} remaining this month.`
                ) : (
                  "⭐️ You've used all your free meetups for this month."
                )}
                {' '}
                <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/upgrade`} style={upgradeLink}>
                  Upgrade to Pro for unlimited meetups!
                </Link>
              </Text>
            </div>
          )}

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

const footer = {
  color: '#666',
  fontSize: '14px',
  marginTop: '32px',
  textAlign: 'center' as const,
  fontStyle: 'italic',
}

const detailsBox = {
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '24px',
}

const detailsTitle = {
  fontSize: '16px',
  fontWeight: '600',
  marginBottom: '8px',
  color: '#111',
}

const detailsText = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#444',
  margin: '0',
} 