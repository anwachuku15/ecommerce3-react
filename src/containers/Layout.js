import React from "react";
import {
  Container,
  Divider,
  Dropdown,
  Grid,
  Header,
  Image,
  List,
  Menu,
  Segment,
} from "semantic-ui-react";
// import axios from 'axios';
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { logout, authSuccess } from "../store/actions/auth";
import { fetchCart } from "../store/actions/cart";
import { authSucess } from "../store/reducers/auth";

class Layout extends React.Component {

  state = {

  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  componentDidMount() {
    this.props.refreshCart();
    console.log('cart fetched')
  }

  
  
  render() {
    const { authenticated, cart, loading } = this.props;
    
    console.log(authenticated)

    const {activeItem} = this.state;
    var cartTotal = 0;
    cart && cart.order_items.map(order_item => {
      cartTotal += order_item.quantity
      return cartTotal;
    })

    return (
      <div>
        {/* NAVBAR */}
        <Menu color='blue' fixed='top'>
          <Container>

            <Link to="/">
              <Menu.Item 
                header
                name='home'
                active={activeItem === 'home'}
                // onClick={this.handleItemClick}
              />
            </Link>


            <Link to="/products">
              <Menu.Item 
                header
                name='products'
                active={activeItem === 'products'}
                // onClick={this.handleItemClick}
              />
            </Link>
            

            <Menu.Menu position='right'>
              {authenticated ? (
                <React.Fragment>
                  <Link to='/profile'>
                    <Menu.Item 
                      header
                      name='profile'
                      active={activeItem === 'profile'}
                      // onClick={this.handleItemClick}
                    />
                  </Link>
                  <Dropdown
                    simple
                    icon='shopping cart'
                    loading={loading}
                    text={`${cartTotal}`}
                    // pointing
                    className='link item'
                  >
                    <Dropdown.Menu direction='left'>
                      {cart !== null ? (
                        <React.Fragment>
                          {cart.order_items.map(order_item => {
                            return (
                              <Dropdown.Item key={order_item.id}>
                                {order_item.item.name} (Qty: {order_item.quantity})
                              </Dropdown.Item>
                            )
                          })}
                          {cart && cart.order_items.length < 1 ? <Dropdown.Item onClick={() => {this.props.history.push('/order-summary'); this.setState({activeItem: ''})}}>Your cart is currently empty.</Dropdown.Item> : null}
                          
                          <Dropdown.Divider />
                          <Dropdown.Item icon='arrow right' text='Checkout' onClick={() => {this.props.history.push('/order-summary'); this.setState({activeItem: ''})}}/>
                        </React.Fragment>
                      ) : (
                        <Dropdown.Item onClick={() => {this.props.history.push('/order-summary'); this.setState({activeItem: ''})}}>No items in your cart</Dropdown.Item>
                      )}
                    </Dropdown.Menu>

                  </Dropdown>
                  <Menu.Item header onClick={() => {this.props.logout(); this.setState({activeItem: ''})}}>
                    Logout
                  </Menu.Item>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Link to="/login">
                    <Menu.Item 
                      header
                      name='login'
                      active={activeItem === 'login'}
                      // onClick={this.handleItemClick}
                    />
                  </Link>
                  <Link to="/signup">
                    <Menu.Item 
                      header
                      name='signup'
                      active={activeItem === 'signup'}
                      // onClick={this.handleItemClick}
                    />
                  </Link>
                </React.Fragment>
              )}
            </Menu.Menu>

          </Container>
        </Menu>
        
        {this.props.children}
        

        {/* FOOTER */}
        <Segment
          inverted
          vertical
          style={{ margin: "5em 0em 0em", padding: "5em 0em" }}
        >
          <Container textAlign="center">
            <Grid divided inverted stackable>
              <Grid.Column width={3}>
                <Header inverted as="h4" content="Group 1" />
                <List link inverted>
                  <List.Item as="a">Link One</List.Item>
                  <List.Item as="a">Link Two</List.Item>
                  <List.Item as="a">Link Three</List.Item>
                  <List.Item as="a">Link Four</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={3}>
                <Header inverted as="h4" content="Group 2" />
                <List link inverted>
                  <List.Item as="a">Link One</List.Item>
                  <List.Item as="a">Link Two</List.Item>
                  <List.Item as="a">Link Three</List.Item>
                  <List.Item as="a">Link Four</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={3}>
                <Header inverted as="h4" content="Group 3" />
                <List link inverted>
                  <List.Item as="a">Link One</List.Item>
                  <List.Item as="a">Link Two</List.Item>
                  <List.Item as="a">Link Three</List.Item>
                  <List.Item as="a">Link Four</List.Item>
                </List>
              </Grid.Column>
              <Grid.Column width={7}>
                <Header inverted as="h4" content="Footer Header" />
                <p>
                  Extra space for a call to action inside the footer that could
                  help re-engage users.
                </p>
              </Grid.Column>
            </Grid>

            <Divider inverted section />
            <Image centered size="mini" src="/logo.png" />
            <List horizontal inverted divided link size="small">
              <List.Item as="a" href="#">
                Site Map
              </List.Item>
              <List.Item as="a" href="#">
                Contact Us
              </List.Item>
              <List.Item as="a" href="#">
                Terms and Conditions
              </List.Item>
              <List.Item as="a" href="#">
                Privacy Policy
              </List.Item>
            </List>
          </Container>
        </Segment>
      </div>
    );
  }
  
}

const mapStateToProps = state => {
  return {
    authenticated: state.auth.token !== null,
    cart: state.cart.shoppingCart,
    loading: state.cart.loading
  };
};


const mapDispatchToProps = dispatch => {
  return {
    logout: () => dispatch(logout()),
    refreshCart: () => dispatch(fetchCart()),
  };
};

// Layout Component wrapped withRouter, giving it access to location properties
export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Layout)
);
