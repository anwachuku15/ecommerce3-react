import React from 'react';
import { connect } from 'react-redux'
// import { Redirect } from 'react-router-dom'
import { Button, Card, Dimmer, Divider, Form, Grid, Header, Icon, Image, Label, Loader, Menu, Message, Segment } from 'semantic-ui-react'
import { addressListURL, addressCreateURL, addressUpdateURL, addressMakeDefaultURL, addressRemoveDefaultURL, addressDeleteURL, countryListURL, userIDURL } from '../URLconstants'
import {authAxios} from '../utils'

const UPDATE_FORM = 'UPDATE_FORM';
const CREATE_FORM = 'CREATE_FORM';

class AddressForm extends React.Component {
   state = { 
      loading: false,
      error: null,
      formData: {
         address_type: "",
         apartment_address: "",
         country: "",
         default: false,
         id: '',
         street_address: "",
         user: "",
         zip: "",
      },
      saving: false,
      success: false,
      visible: true
   }

   componentDidMount() {
      const { address, formType } = this.props;
      console.log(address);
      if (formType === UPDATE_FORM) {
         this.setState({ formData: address })
      }
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

   handleSubmit = e => {
      this.setState({ saving: true })
      e.preventDefault();
      const {formType} = this.props;
      if (formType === UPDATE_FORM) {
         this.handleUpdateAddress();
      } else {
         this.handleCreateAddress();
      }
   }

   handleCreateAddress = () => {
      const { userID, activeItem  } = this.props;
      const { formData } = this.state;
      authAxios
         .post(addressCreateURL, {
            ...formData,
            user: userID,
            address_type: activeItem === 'billingAddress' ? 'B' : 'S'
         })
         .then(res => {
            this.setState({ saving: false, success: true});
            this.props.callback();
         })
         .catch(err => {
            this.setState({error: err})
         })
      console.log(formData)
   }

   handleUpdateAddress = () => {
      const { userID, activeItem } = this.props;
      const { formData } = this.state;
      authAxios
         .put(addressUpdateURL(formData.id), {
            ...formData,
            user: userID,
            address_type: activeItem === 'billingAddress' ? 'B' : 'S'
         })
         .then(res => {
            this.setState({ saving: false, success: true});
            this.props.callback();
         })
         .catch(err => {
            this.setState({error: err})
         })
      console.log(formData)
      console.log(this.state.error)
   }

   handleDismiss = () => {
      this.setState({ visible: false })
      // setTimeout(() => {
      //    this.setState({ visible: true })
      // }, 2000)
   }

   render() {
      const {countries, selectedAddress} = this.props;
      const { saving, success, error, formData, visible } = this.state;
      return (
         <Form onSubmit={this.handleSubmit} success={success} error={error}>
            <Form.Input required onChange={this.handleChange} name='street_address' placeholder='Street Address' label='Street Address' value={formData.street_address}/>
            <Form.Input onChange={this.handleChange} name='apartment_address' placeholder='Apartment Address' label='Apartment Address' value={formData.apartment_address} />
            <Form.Select required onChange={this.handleSelectChange} options={countries} loading={countries.length < 1} name='country' placeholder='Country' label ='Country' value={formData.country} clearable search fluid/>
            <Form.Input required onChange={this.handleChange} name='zip' placeholder='Zip code' label='Zip code' value={formData.zip} />
            <Form.Checkbox onChange={this.handleToggleDefaultAddress} name='default' label='Save as default address' checked={formData.default} />
            {success && visible && (
               <Message
                  success
                  header='Success!'
                  content="Your address was saved"
                  onDismiss={this.handleDismiss}
               />
            )}
            {error && ( // if an error exists
					<Message
						error // this gives red styling
						header='There was an error' // this specifies the error
						content={JSON.stringify(error)} // this explains the error
					/>
            )}
            {selectedAddress === null && (<Form.Button disabled={saving} loading={saving} primary>Save</Form.Button>)}
            {selectedAddress !== null && (<Form.Button disabled={saving} loading={saving} color='yellow'>Update</Form.Button>)}
         </Form>
      )
   }
}

class Profile extends React.Component {

   state = { 
      activeItem: 'billingAddress',
      addresses: [],
      countries: [],
      userID: null,
      selectedAddress: null,
      defaultSelected: null
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

   handleDeleteAddress = addressID => {
      authAxios
         .delete(addressDeleteURL(addressID))
         .then(res => {
            this.handleCallback();
         })
         .catch(err => {
            this.setState({error: err})
         })
   }

   handleSelectAddress = address => {
      console.log(address);
      this.setState({ selectedAddress: address });
   }

   handleMakeDefault = address => {
      authAxios
         .post(addressMakeDefaultURL, {address})
         .then(res => {
            this.handleCallback();
         })
         .catch(err => {
            this.setState({error: err})
         })
   }

   handleRemoveDefault = address => {
      authAxios
         .post(addressRemoveDefaultURL, {address})
         .then(res => {
            this.handleCallback();
         })
         .catch(err => {
            this.setState({error: err})
         })
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

   handleCallback = () => {
      this.handleFetchAddresses();
      this.setState({ selectedAddress: null })
   }


   render() {
      const { activeItem, error, loading, addresses, countries, selectedAddress, userID } = this.state;
      // const {isAuthenticated} = this.props;
      // if (!isAuthenticated) {
      //    return <Redirect to='/login' />
      // }
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
               <Grid.Column width='4'>
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
                     <Menu.Item
                        name='paymentHistory'
                        active={activeItem === 'paymentHistory'}
                        onClick={this.handleItemClick}
                        color='blue'
                     />
                  </Menu>
               </Grid.Column>

               <Grid.Column width='12'>
                  <Header>{`Update your ${activeItem === 'billingAddress' ? 'billing' : 'shipping'} address`}</Header>
                  <Divider/>
                  {addresses.length > 0 && <Card.Group>
                     {addresses.map(a => {
                        return (
                           <Card key={a.id}>
                              <Card.Content>
                              {a.default && (
                                 <React.Fragment>
                                    <Label color='blue' corner='right' icon='pin'></Label>
                                    <Card.Meta textAlign='right' style={{marginRight:'18px'}}>Default</Card.Meta>
                                 </React.Fragment>
                              )}
                              {!a.default && (
                                 <React.Fragment>
                                    <br />
                                 </React.Fragment>
                              )}
                              {a.apartment_address === '' ? 
                                 (<Card.Header>{a.street_address}</Card.Header>) :
                                 (<Card.Header>{a.street_address}, {a.apartment_address}</Card.Header>)
                              }
                                 <Card.Meta>{a.country}</Card.Meta>
                                 <Card.Description>{a.zip}</Card.Description>
                              </Card.Content>
                              <Card.Content extra>
                                 {/* <Button.Group floated> */}
                                    
                                    <Button color='yellow' onClick={() => this.handleSelectAddress(a)} size='small'>
                                       Update
                                    </Button>
                                    <Button color='red' onClick={() => this.handleDeleteAddress(a.id)} size='small'>
                                       Delete
                                    </Button>
                                    {!a.default && <Button
                                                      // basic 
                                                      style={{paddingLeft:'12px', paddingRight:'12px'}} 
                                                      color='blue' 
                                                      onClick={() => {this.handleMakeDefault(a)}} 
                                                      size='small'>Default <Icon style={{marginRight:'0px', marginLeft:'3px'}} name='check circle' /></Button>}
                                    {a.default && <Button
                                                      basic
                                                      style={{paddingLeft:'12px', paddingRight:'12px'}}
                                                      color='grey' 
                                                      onClick={() => {this.handleRemoveDefault(a)}} 
                                                      size='small'> Default <Icon style={{marginRight:'0px', marginLeft:'3px'}} name='minus circle' /></Button>}
                                 {/* </Button.Group> */}
                              </Card.Content>
                              {/* <Card.Content extra>
                              {!a.default && <Button 
                                                      color='black' 
                                                      onClick={() => {this.handleMakeDefault(a) }}
                                                      icon
                                                      labelPosition='right'>Default <Icon color='green' name='check circle outline'/></Button>}
                              </Card.Content> */}
                           </Card>
                        )
                     })}
                  </Card.Group>
                  }
                  {addresses.length > 0 && <Divider/>}

                  {selectedAddress && (<AddressForm callback={this.handleCallback} userID={userID} activeItem={activeItem} selectedAddress={selectedAddress} countries={countries} formType={UPDATE_FORM} address={selectedAddress} />)}
                  {!selectedAddress && (<AddressForm callback={this.handleCallback} userID={userID} activeItem={activeItem} selectedAddress={selectedAddress} countries={countries} formType={CREATE_FORM} />)}

                  
                  
               </Grid.Column>
            </Grid.Row>

         </Grid>
      )
   }
}

const mapStateToProps = state => {
   return {
      isAuthenticated: state.auth.token !== null
   };
};

export default connect(mapStateToProps)(Profile);