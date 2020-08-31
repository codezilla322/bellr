import { Banner, Link } from '@shopify/polaris';

class TrialBanner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showBanner: props.isTrial };
  }

  handleDismiss = () => {
    this.setState({ showBanner: false })
  }

  render() {
    const bannerMarkup = this.state.showBanner ? (
      <Banner onDismiss={this.handleDismiss} status="warning">
        <p>
          Your trial expires in {this.props.expiration} days.{' '}
          <Link url="/subscription">Upgrade Now!</Link>
        </p>
      </Banner>
    ) : null;
    return bannerMarkup;
  }
}

export default TrialBanner;