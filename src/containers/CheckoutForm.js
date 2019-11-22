import React, { Fragment } from 'react';
import {CardElement, Elements, injectStripe, StripeProvider} from 'react-stripe-elements';
import { Button, Container, Dimmer, Divider, Form, Header, Icon, Image, Item, Loader, Message, Segment, Label, Select } from 'semantic-ui-react'
import { Link, withRouter } from 'react-router-dom'
import { authAxios } from '../utils';
import { checkoutURL, orderSummaryURL, addCouponURL, addressListURL } from '../URLconstants';


const OrderPreview = (props) => {
  // CHECKOUT ITEMS
  
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
                  {order_item.item_variations.map(iv => {
                    return (
                      <Fragment key={iv.id}>
                        {iv.attachment && (<Item.Image size='small' src={`${localhost}${iv.attachment}`} />)}
                      </Fragment>
                    )
                  })}
                  <Item.Content verticalAlign='middle'>
                    <Item.Header as='a' href={`/products/${order_item.item.id}`}>{order_item.item.name}</Item.Header>
                    {order_item.item_variations.map(iv => {
                      return (
                          <Item.Extra key={iv.id}>{iv.variation.name}: {iv.value}</Item.Extra>
                      )
                    })}
                    <Item.Extra>(Qty: {order_item.quantity})</Item.Extra>
                    <Item.Extra>
                      {order_item.item.discount_price 
                        ? <div>
                            <Label color='blue' basic>
                              ${order_item.item.discount_price}
                            </Label>
                            <Label color='green' basic>On Sale!</Label>
                          </div>
                        : <Label color='blue' basic>${order_item.item.price}</Label>}
                      
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
    success: false,
    billingAddresses: [],
    shippingAddresses: [],
    selectedBillingAddress: '',
    selectedShippingAddress: ''
  }
  

  componentDidMount() {
    this.handleFetchOrder();
    this.handleFetchBillingAddresses();
    this.handleFetchShippingAddresses();
  }

  handleGetDefaultAddress = addresses => {
    const filteredAddresses = addresses.filter(el => el.default === true);
    if (filteredAddresses.length > 0) {
      return filteredAddresses[0].id;
    }
    return '';
  }

  handleFetchBillingAddresses = () => {
    this.setState({loading: true});
    authAxios
    .get(addressListURL('B'))
    .then(res => {
      this.setState({billingAddresses: res.data.map(a => {
        return {
          key: a.id,
          text: `${a.street_address}, ${a.apartment_address}, ${a.country}`,
          value: a.id
        };
      }), 
      selectedBillingAddress: this.handleGetDefaultAddress(res.data),
      loading: false});
    })
    .catch(err => {
      this.setState({error: err, loading: false});
    });
  }

  handleFetchShippingAddresses = () => {
    this.setState({loading: true});
    authAxios
    .get(addressListURL('S'))
    .then(res => {
      this.setState({shippingAddresses: res.data.map(a => {
        return {
          key: a.id,
          text: `${a.street_address}, ${a.apartment_address}, ${a.country}`,
          value: a.id
        };
      }), 
      selectedShippingAddress: this.handleGetDefaultAddress(res.data),
      loading: false});
    })
    .catch(err => {
      this.setState({error: err, loading: false});
    });
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
        this.props.history.push('/products');
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

  handleSelectChange = (e, {name, value}) => {
    // console.log(name);
    // console.log(value);
    this.setState({ [name]: value });
  }

  submit = (ev) => {
    ev.preventDefault();
    this.setState({loading: true});
    if (this.props.stripe) {
      this.props.stripe.createToken().then(result => {
        if (result.error) {
          this.setState({error: result.error.message, loading: false})
        } else {
            this.setState({error: null});
            const { selectedBillingAddress, selectedShippingAddress } = this.state;
            authAxios.post(checkoutURL, {
              stripeToken: result.token.id, 
              selectedBillingAddress, 
              selectedShippingAddress
            })
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

  // COUPON & PAYMENT FORM
  render() {
    const {data, 
          error, 
          loading, 
          success, 
          billingAddresses, 
          shippingAddresses, 
          selectedBillingAddress, 
          selectedShippingAddress
          } = this.state;
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
        

        <OrderPreview data={data} />

        <Divider />

        <CouponForm handleAddCoupon={(e, code) => this.handleAddCoupon(e, code)} />

        <Divider horizontal>
          <Header as='h4'>
            <Icon name='payment' />
            Payment Information
          </Header>
        </Divider>
        
        <Header>Select a billing address</Header>
        {billingAddresses.length > 0 
          ? <Select 
              name='selectedBillingAddress'
              onChange={this.handleSelectChange}
              value={selectedBillingAddress} 
              clearable 
              options={billingAddresses} 
              selection 
            />
          : <p>
              You need to <Link to='/profile'>add a billing address</Link> in profile
            </p>
        }
        
        <Header>Select a shipping address</Header>
        {shippingAddresses.length > 0 
          ? <Select 
              name='selectedShippingAddress'
              onChange={this.handleSelectChange}
              value={selectedShippingAddress} 
              clearable 
              options={shippingAddresses} 
              selection 
            />
          : <p>
              You need to <Link to='/profile'>add a shipping address</Link> in profile
            </p>
        }
        
        {billingAddresses.length < 1 || shippingAddresses.length < 1 ? (
          <Header style={{textAlign:'center'}}>
            Add billing and shipping addresses to complete your purchase
          </Header>
          ) : (
            <Fragment>
              <p style={{float:'center'}}>Would you like to complete the purchase?</p>
              <CardElement />
              {success && (
                <Message positive>
                  <Message.Header>Your payment was successful</Message.Header> 
                  <p>Go to your <b>profile</b> to see the order delivery status.</p> 
                </Message>
              )}
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
            </Fragment>
          )
        }
      </div>
    );
  }
}

const InjectedForm =  withRouter(injectStripe(CheckoutForm));

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