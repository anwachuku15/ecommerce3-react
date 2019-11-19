import React, { Fragment } from 'react';
import {CardElement, Elements, injectStripe, StripeProvider} from 'react-stripe-elements';
import { Button, Checkbox, Container, Dimmer, Divider, Form, Header, Icon, Image, Item, Loader, Message, Segment, Label } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { authAxios } from '../utils';
import { checkoutURL, orderSummaryURL, addCouponURL } from '../URLconstants';


const OrderPreview = (props) => {
  const {data} = props;
  return (
    <Fragment>
      {data &&
        <Fragment>
          <Item.Group divided>
            {data.order_items.map(order_item => {
              const localhost = 'http://localhost:8000';
              return (
                <Item key={order_item.id}>
                  <Item.Image size='tiny' src={`${localhost}${order_item.item_obj.image}`} />
                  <Item.Content verticalAlign='middle'>
                    <Item.Header as='a'>{order_item.item}</Item.Header>
                    <Item.Extra>(Qty: {order_item.quantity})</Item.Extra>
                    <Item.Extra>
                      {order_item.item_obj.discount_price 
                        ? <div>
                            <Label color='blue' basic>
                              ${order_item.item_obj.discount_price}
                            </Label>
                            <Label color='green' basic>On Sale!</Label>
                          </div>
                        : <Label color='blue' basic>${order_item.item_obj.price}</Label>}
                      
                    </Item.Extra>
                  </Item.Content>
                </Item>
              )
            })}
            <Item>
              <Item.Content>
                <Item.Header>Order Total: ${data.total}</Item.Header>
                {data.coupon && 
                  <Label color='green' style={{marginLeft:'10px'}}>
                    Coupon '{data.coupon.code}' applied for {data.coupon.amount}
                  </Label>
                }
              </Item.Content>
            </Item>
          </Item.Group>
        </Fragment>
      }
    </Fragment>
  );
}


class CouponForm extends React.Component {
  
  state = {
    code: ''
  }

  handleChange = e => {
    this.setState({
      code: e.target.value
    })
  }

  handleSubmit = (e) => {
    const {code} = this.state
    this.props.handleAddCoupon(e, code)
    this.setState({code: ''})
  }

  render() {
    const {code} = this.state;
    return (
      <Fragment>
        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Coupon Code</label>
            <input value={code} onChange={this.handleChange} placeholder='Enter a coupon' />
          </Form.Field>
          <Button type='submit' color='purple'>Redeem</Button>
        </Form>
      </Fragment>
    )
  }
}


class CheckoutForm extends React.Component {
  state = {
    data: null,
    loading: false,
    error: null,
    success: false
  }

  componentDidMount() {
    this.handleFetchOrder();
  }

  handleFetchOrder = () => {
    this.setState({loading: true});
    authAxios
    .get(orderSummaryURL)
    .then(res => {
       this.setState({data: res.data, loading: false});
    })
    .catch(err => {
       if (err.response.status === 404) {
          console.log(err.response)
          this.setState({error: 'You currently do not have an order', loading: false})
       } else {
          this.setState({error: err, loading: false});
       }
    });
  }

  handleAddCoupon = (e, code) => {
    e.preventDefault();
    this.setState({loading: true});
    authAxios
      .post(addCouponURL, {code})
      .then(res => {
        this.setState({loading: false})
        this.handleFetchOrder();
      })
      .catch(err => {
        this.setState({error: err, loading: false});
      })
  }

  submit = (ev) => {
    ev.preventDefault();
    this.setState({loading: true});
    if (this.props.stripe) {
      this.props.stripe.createToken().then(result => {
        if (result.error) {
          this.setState({error: result.error.message, loading: false})
        } else {
            authAxios.post(checkoutURL, {stripeToken: result.token.id})
            .then(res => { 
              this.setState({ loading: false, success: true });
              // redirect user
            })
            .catch(err => {
              this.setState({ loading: false, error: err});
            });
        }
      });
    } else {
      console.log("Stripe is not loaded")
    }
  }

  render() {
    const {data, error, loading, success} = this.state;
    return (
      <div>
        {error && ( // if an error exists
					<Message
						error // this gives red styling
						header='There was some errors with your submission' // this specifies the error
						content={JSON.stringify(error)} // this explains the error
					/>
				)}
				{loading && ( // if loading: true
					<Segment>
						<Dimmer active inverted>
							<Loader inverted>Loading</Loader>
						</Dimmer>
				
						<Image src='/images/wireframe/short-paragraph.png' />
					</Segment>
				)}
        {success && <Message positive>
          <Message.Header>Your payment was successful</Message.Header> 
          <p>Go to your <b>profile</b> to see the order delivery status.</p> 
        </Message>}

        <OrderPreview data={data} />

        <Divider />

        <CouponForm handleAddCoupon={(e, code) => this.handleAddCoupon(e, code)} />

        <Divider horizontal>
          <Header as='h4'>
            <Icon name='payment' />
            Payment Information
          </Header>
        </Divider>

        <p>Would you like to complete the purchase?</p>
        <CardElement />
        <Button.Group style={{marginTop: '10px'}}>
          <Link to='/order-summary'><Button>Cancel</Button></Link>
          <Button.Or />
          <Button 
            loading={loading}
            disabled={loading}
            onClick={this.submit} 
            primary
          >
              Purchase
          </Button>
        </Button.Group>
        
      </div>
    );
  }
}

const InjectedForm = injectStripe(CheckoutForm);

const WrappedForm = () => (
  <Container text>
    <StripeProvider apiKey="pk_test_Y24gru2RVIHjVCmIiDwbzFwJ001gcNCf0i">
      <div>
        <h1 align='center'>Checkout</h1>
        <hr/>
        <Elements>
          <InjectedForm/>
        </Elements>
      </div>
    </StripeProvider>
  </Container>
  )

  export default WrappedForm