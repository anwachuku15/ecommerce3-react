import React from 'react'
import { authAxios } from '../utils'
import { Button, Container, Header, Icon, Image, Item, Label, Menu, Table } from 'semantic-ui-react'
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
         console.log(this.state.data.order_items[0].item_obj.image)
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

   render() {
      const {data, error, loading} = this.state;
      console.log(data);
      return (
         <Container>
            <Header as='h3'>Order Summary</Header>
            {data && <Table celled>
               <Table.Header>
               <Table.Row>
                  <Table.HeaderCell>Item #</Table.HeaderCell>
                  <Table.HeaderCell>Price</Table.HeaderCell>
                  <Table.HeaderCell>Quantity</Table.HeaderCell>
                  <Table.HeaderCell>Total Price</Table.HeaderCell>
               </Table.Row>
               </Table.Header>
         
               <Table.Body>
                  {data.order_items.map((order_item, i) => {
                     const localhost = 'http://localhost:8000';
                     const item_img = order_item.item_obj.image;
                     var item_img_url = localhost + item_img;
                     return (
                        <Table.Row key={order_item.id}>
                           <Table.Cell>
                              <Header as='h4' image>
                                 {/* <Image src='https://react.semantic-ui.com/images/avatar/small/lena.png' rounded size='mini' /> */}
                                 <Image src={`http://localhost:8000${order_item.item_obj.image}`} rounded size='large' />
                                 <Header.Content>
                                    {order_item.item}
                                 <Header.Subheader>Size: </Header.Subheader>
                                 </Header.Content>
                              </Header>
                           </Table.Cell>
                           <Table.Cell>${order_item.item_obj.price}</Table.Cell>
                           <Table.Cell>{order_item.quantity}</Table.Cell>
                           <Table.Cell>
                              {order_item.item_obj.discount_price && <Label color='green' ribbon>ON DISCOUNT!</Label>}
                              {order_item.final_price}
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

export default OrderSummary