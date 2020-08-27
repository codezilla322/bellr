import { Page, Layout, TextContainer, Heading, Link, Banner } from '@shopify/polaris';
import createApp from '@shopify/app-bridge';
import { Redirect } from '@shopify/app-bridge/actions';
import Cookies from 'js-cookie';
import { TrialBanner } from '@components';

class Index extends React.Component {
  state = {
    loading: true,
    trial: true,
    paid: false,
    connected: false
  };

  componentDidMount() {
    this.setState({
      loading: false,
      trial: true,
      paid: false,
      connected: false
    });

    //   const app = createApp({
    //     apiKey: '8e4754eea91404dcef1d830345af8f08',
    //     shopOrigin: Cookies.get("shopOrigin")
    //   });
    //   const redirect = Redirect.create(app);
    //   return redirect.dispatch(Redirect.Action.APP, '/subscription');
  }

  render() {
    if (this.state.loading) {
      return null;
    }
    if (this.state.connected) {
      return (
        <Page>
          <TrialBanner></TrialBanner>
        </Page>
      );
    } else {
      return (
        <Page title="Welcome to Slackify!">
          <Layout sectioned>
            <TextContainer>
              <Heading>
                With Slackify, you can receive important order notifications and sales report sent straight to Slack.
                To get started, click the "Add to Slack" button below.
              </Heading>
              <p>
                <Link
                  url="https://slack.com/oauth/v2/authorize?client_id=1327331675796.1319331539525&scope=incoming-webhook&user_scope="
                  external>
                  <img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
                </Link>
              </p>
            </TextContainer>
          </Layout>
        </Page>
      );
    }
  }
}

export default Index;