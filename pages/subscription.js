import { Page, Layout, TextContainer, Heading, Link } from '@shopify/polaris';

class Subscription extends React.Component {
  state = {
    trial: true,
    paid: false
  };
  render() {
    return (
      <Page title="Subscription"></Page>
    );
  }
}

export default Subscription;