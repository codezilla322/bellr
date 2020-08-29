import { Page, Layout, Card, Heading, List, Icon, Button } from '@shopify/polaris';
import { TickMinor } from '@shopify/polaris-icons';
import createApp from '@shopify/app-bridge';
import { Redirect } from '@shopify/app-bridge/actions';
import Cookies from 'js-cookie';

class Subscription extends React.Component {
  state = {
    trial: true,
    current: ''
  };
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
                    <Button primary onClick={this.handleChooseBasic}>Choose this plan</Button>
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
                    <Button primary onClick={this.handleChoosePremium}>Choose this plan</Button>
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