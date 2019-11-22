import React from 'react';
import { Card, Dimmer, Divider, Form, Grid, Header, Image, Label, Loader, Menu, Message, Segment } from 'semantic-ui-react'
import { addressListURL, addressCreateURL, countryListURL, userIDURL } from '../URLconstants'
import {authAxios} from '../utils'

class Profile extends React.Component {

   state = { 
      activeItem: 'billingAddress',
      addresses: [],
      countries: [],
      loading: false,
      error: null,
      formData: {default: false},
      saving: false,
      success: false,
      userID: null
   }

   componentDidMount() {
      this.handleFetchAddresses();
      this.handleFetchCountries();
      this.handleFetchUserID();
   }

   handleItemClick = (e, { name }) => {
      
      this.setState({ activeItem: name }, () => {
         this.handleFetchAddresses();
      });
   }

   handleFetchUserID = () => {
      authAxios
         .get(userIDURL)
         .then(res => {
            this.setState({ userID: res.data.userID })
         })
         .catch(err => {
            this.setState({error: err})
         })
   }


   handleFormatCountries = countries => {
      const keys = Object.keys(countries);
      return keys.map(k => {
         return {
            key: k,
            text: countries[k],
            value: k
         }
      })
   }

   handleFetchCountries = () => {
      authAxios
         .get(countryListURL)
         .then(res => {
            this.setState({countries: this.handleFormatCountries(res.data)})
         })
         .catch(err => {
            this.setState({error: err})
         })
   }


   handleFetchAddresses = () => {
      this.setState({loading: true});
      const {activeItem} = this.state;
      authAxios
         .get(addressListURL(activeItem === 'billingAddress' ? 'B' : 'S'))
         .then(res => {
            this.setState({ addresses: res.data, loading: false })
         })
         .catch(err => {
            this.setState({error: err})
         })
   }

   handleChange = e => {
      const {formData} = this.state;
      const updatedFormData = {
         ...formData,
         [e.target.name]: e.target.value
      }
      this.setState({
         formData: updatedFormData
      })
   }

   handleSelectChange = (e, { name, value }) => {
      const {formData} = this.state;
      const updatedFormData = {
         ...formData,
         [name]: value
      };
      this.setState({
         formData: updatedFormData
      });
   }

   handleToggleDefaultAddress = () => {
      const {formData} = this.state;
      const updatedFormData = {
         ...formData,
         default: !formData.default
      };
      this.setState({ 
         formData: updatedFormData
      });
   }

   handleCreateAddress = e => {
      this.setState({ saving: true })
      e.preventDefault();
      const { activeItem, formData, userID} = this.state;
      authAxios
         .post(addressCreateURL, {
            ...formData,
            user: userID,
            address_type: activeItem === 'billingAddress' ? 'B' : 'S'
         })
         .then(res => {
            this.setState({ saving: false, success: true})
         })
         .catch(err => {
            this.setState({error: err})
         })
      console.log(formData)
   }


   render() {
      const { activeItem, error, loading, addresses, countries, saving, success } = this.state;
      return (
         <Grid container columns='2' divided>
            <Grid.Row columns='1'>
               <Grid.Column>
               {error && ( // if an error exists
					<Message
						error // this gives red styling
						header='There was an error' // this specifies the error
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
               </Grid.Column>
            </Grid.Row>
            <Grid.Row>
               <Grid.Column width='6'>
               <Menu pointing vertical fluid>
                  <Menu.Item
                     name='billingAddress'
                     active={activeItem === 'billingAddress'}
                     onClick={this.handleItemClick}
                     color='blue'
                  />
                  <Menu.Item
                     name='shippingAddress'
                     active={activeItem === 'shippingAddress'}
                     onClick={this.handleItemClick}
                     color='blue'
                  />
               </Menu>
               </Grid.Column>
               <Grid.Column width='10'>
                  <Header>{`Update your ${activeItem === 'billingAddress' ? 'billing' : 'shipping'} address`}</Header>
                  <Divider/>
                  {addresses.length > 0 && <Card.Group>
                     {addresses.map(a => {
                        return (
                           <Card key={a.id}>
                              <Card.Content>
                              {a.default && <Label as='a' color='red' ribbon='right'>Default</Label>}
                                 <Card.Header>{a.street_address}, {a.apartment_address}</Card.Header>
                                 <Card.Meta>{a.country}</Card.Meta>
                                 <Card.Description>{a.zip}</Card.Description>
                              </Card.Content>
                           </Card>
                        )
                     })}
                  </Card.Group>
                  }
                  {addresses.length > 0 && <Divider/>}
                  
                  <Form onSubmit={this.handleCreateAddress} success={success}>
                     {/* <p>Billing Address Form</p> */}
                     <Form.Input required onChange={this.handleChange} name='street_address' placeholder='Street Address' label='Street Address'/>
                     <Form.Input onChange={this.handleChange} name='apartment_address' placeholder='Apartment Address' label='Apartment Address'/>
                     <Form.Select required onChange={this.handleSelectChange} options={countries} loading={countries.length < 1} name='country' placeholder='Country' label ='Country' clearable search fluid/>
                     <Form.Input required onChange={this.handleChange} name='zip' placeholder='Zip code' label='Zip code' />
                     <Form.Checkbox onChange={this.handleToggleDefaultAddress} name='default' label='Save as default address' />
                     {success && (
                        <Message
                           success
                           header='Success!'
                           content="Your address was saved"
                        />
                     )}
                     <Form.Button disabled={saving} loading={saving} primary>Save</Form.Button>
                  </Form>
               </Grid.Column>
            </Grid.Row>
         </Grid>
      )
   }
}

export default Profile