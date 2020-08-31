import { Page, Layout, Card, Heading, List, Icon, Button, Badge } from '@shopify/polaris';
import { TickMinor } from '@shopify/polaris-icons';
import createApp from '@shopify/app-bridge';
import { Redirect } from '@shopify/app-bridge/actions';
import Cookies from 'js-cookie';
import * as constants from '@libs/constants';

class Subscription extends React.Component {
  state = {
    loading: true,
    paid: false,
    plan: constants.subscription.plan.TRIAL
  };
  componentDidMount() {
    fetch('/api/settings')
      .then(response => response.json())
      .then(data => {
        this.setState({ loading: false, paid: data.paid, plan: data.plan });
      });
  }
  handleChooseBasic() {
    const app = createApp({
      apiKey: process.env.API_KEY,
      shopOrigin: Cookies.get("shopOrigin")
    });
    const redirect = Redirect.create(app);
    return redirect.dispatch(Redirect.Action.REMOTE, `${process.env.HOST}/api/subscription/?plan=basic`);
  }
  handleChoosePremium() {
    const app = createApp({
      apiKey: process.env.API_KEY,
      shopOrigin: Cookies.get("shopOrigin")
    });
    const redirect = Redirect.create(app);
    return redirect.dispatch(Redirect.Action.REMOTE, `${process.env.HOST}/api/subscription/?plan=premium`);
  }
  render() {
    if (this.state.loading)
      return null;
    let buttonBasic = <Button primary onClick={this.handleChooseBasic}>Choose this plan</Button>;
    if (this.state.paid && this.state.plan == constants.subscription.plan.BASIC)
      buttonBasic = <div className="badge-wrapper"><Badge status="info" size="medium">Your Current Plan</Badge></div>;
    let buttonPremium = <Button primary onClick={this.handleChoosePremium}>Choose this plan</Button>;
    if (this.state.paid && this.state.plan == constants.subscription.plan.PREMIUM)
      buttonPremium = <div className="badge-wrapper"><Badge status="info" size="medium">Your Current Plan</Badge></div>;
    return (
      <Page title="Subscription">
        <Layout>
            <Layout.Section oneHalf>
              <Card>
                <Card.Section>
                  <div className="subscription-plan">
                    <Heading element="h3">Basic Plan</Heading>
                    <List>
                      <List.Item>
                        <Icon source={TickMinor}></Icon>
                        <p>New order notification</p>
                      </List.Item>
                      <List.Item>
                        <Icon source={TickMinor}></Icon>
                        <p>Cancelled order notification</p>
                      </List.Item>
                      <List.Item>
                        <Icon source={TickMinor}></Icon>
                        <p>Paid order notification</p>
                      </List.Item>
                      <List.Item>
                        <Icon source={TickMinor}></Icon>
                        <p>Fulfilled order notification</p>
                      </List.Item>
                      <List.Item>
                        <Icon source={TickMinor}></Icon>
                        <p>Partially fulfilled order notification</p>
                      </List.Item>
                    </List>
                    {buttonBasic}
                  </div>
                </Card.Section>
              </Card>
            </Layout.Section>
            <Layout.Section oneHalf>
              <Card className="subscription-plan">
                <Card.Section>
                <div className="subscription-plan">
                    <Heading element="h3">Premium Plan</Heading>
                    <List>
                      <List.Item>
                        <Icon source={TickMinor}></Icon>
                        <p>All basic plan features</p>
                      </List.Item>
                      <List.Item>
                        <Icon source={TickMinor}></Icon>
                        <p>Daily sales report</p>
                      </List.Item>
                    </List>
                    {buttonPremium}
                  </div>
                </Card.Section>
              </Card>
            </Layout.Section>
        </Layout>
      </Page>
    );
  }
}

export default Subscription;