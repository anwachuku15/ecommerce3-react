import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { authAxios } from '../utils'
import { Button, Container, Dimmer, Header, Image, Label, Loader, Table, Divider, Message, Segment } from 'semantic-ui-react'
import { orderSummaryURL } from '../URLconstants'
import { Link } from 'react-router-dom'


class OrderSummary extends React.Component {
   
   state = {
      data: null,
      error: null,
      loading: false
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
            this.setState({error: 'You currently do not have an order', loading: false});
            console.log(err.response);
         } else {
            this.setState({error: err, loading: false});
         }
      });
   }

   renderVariations = orderItem => {
      // const lineBreak = React.createElement('br')
      let text = '';
      orderItem.item_variations.forEach(iv => {
         text += `${iv.variation.name}: ${iv.value}`
      })
      return text;
   }

   render() {
      const {data, error, loading} = this.state;
      const isAuthenticated = this.props;
      if (!isAuthenticated) {
         return <Redirect to='/login' />
      }
      if (data !== null) {
         console.log(data.order_items[0].item_variations[0].attachment)
      } 
      return (
         <Container>
            <Header as='h3' style={{textAlign:'center'}}>Order Summary</Header>
            <Divider />
            {error && (
               <Message
                  error
                  header="There was an error"
                  content={JSON.stringify(error)}
               />
            )}
            {loading && (
               <Segment>
               <Dimmer active>
                 <Loader />
               </Dimmer>
           
               <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
             </Segment>
            )}
            {data==null && <Header.Subheader style={{textAlign:'center'}}>Your cart is currently empty</Header.Subheader>}
            {data && <Table celled>
               <Table.Header>
               <Table.Row>
                  <Table.HeaderCell>Item</Table.HeaderCell>
                  <Table.HeaderCell>Price</Table.HeaderCell>
                  <Table.HeaderCell>Quantity</Table.HeaderCell>
                  <Table.HeaderCell>Total Price</Table.HeaderCell>
               </Table.Row>
               </Table.Header>
         
               <Table.Body>
                  {data.order_items.map((orderItem, i) => {
                     return (
                        <Table.Row key={orderItem.id}>
                           <Table.Cell>
                           
                              <Header as='h4' image>
                                 {orderItem.item_variations.map(iv => {
                                    return (
                                       <Fragment key={iv.id}>
                                          {iv.attachment && (
                                             <Image src={`http://localhost:8000${iv.attachment}`} rounded size='huge' />
                                          )}
                                       </Fragment>
                                    )
                                 })}
                                 
                                 <Header.Content>
                                 <Link to={`/products/${orderItem.item.id}`}><Header.Content>{orderItem.item.name}</Header.Content></Link>
                                       {/* <Header.Subheader key={orderItem.item.id}>{this.renderVariations(orderItem)}</Header.Subheader> */}
                                       {orderItem.item_variations.map(iv => {
                                          return (
                                             <Header.Subheader key={iv.id}>{iv.variation.name}: {iv.value}</Header.Subheader>
                                          )
                                       })}
                                 </Header.Content>
                              </Header>
                              
                           </Table.Cell>
                           <Table.Cell>${orderItem.item.price}</Table.Cell>
                           <Table.Cell>{orderItem.quantity}</Table.Cell>
                           <Table.Cell>
                              {orderItem.item.discount_price && <Label color='green' ribbon>ON DISCOUNT!</Label>}
                              ${orderItem.final_price}
                           </Table.Cell>
                        </Table.Row>
                     )
                  })}
                  <Table.Row>
                     <Table.Cell colSpan='3'/>
                     <Table.Cell textAlign='left'>
                        Total: ${data.total}
                     </Table.Cell>
                  </Table.Row>
               </Table.Body>
                  
               <Table.Footer>
               <Table.Row>
                  <Table.HeaderCell colSpan='5' textAlign='right'>
                     <Link to='/checkout'><Button color='yellow'>Checkout</Button></Link>
                  </Table.HeaderCell>
               </Table.Row>
               </Table.Footer>
            </Table>
            }
       </Container>
      )
   }

}

const mapStateToProps = state => {
   return {
      isAuthenticated: state.auth.token !== null
   }
}

export default connect(mapStateToProps)(OrderSummary)