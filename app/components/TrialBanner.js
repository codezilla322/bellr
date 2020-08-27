import { Banner, Link } from '@shopify/polaris';

class TrialBanner extends React.Component {
  state = { showBanner: true };

  handleDismiss = () => {
    this.setState({ showBanner: false })
  }

  render() {
    const bannerMarkup = this.state.showBanner ? (
      <Banner onDismiss={this.handleDismiss} status="warning">
        <p>
          Your trial expires in 7 days.{' '}
          <Link url="/subscription">Upgrade Now!</Link>
        </p>
      </Banner>
    ) : null;
    return bannerMarkup;
  }
}

export default TrialBanner;