import React, { Fragment } from 'react'
// Router gives us access to match properties that allow us to access url parameters
import { withRouter } from 'react-router-dom'
// React-Redux connects actions to the component
import { connect } from "react-redux";

import axios from 'axios'
import { Button, 
			Container, 
			Card, 
			Dimmer, 
			Divider, 
			Form,
			Grid, 
			Header, 
			Icon, 
			Image, 
			Item, 
			Label, 
			Loader, 
			Message,
			Segment,
			Select,  
			} from 'semantic-ui-react'
import { productDetailURL, addToCartURL } from '../URLconstants'
import { authAxios } from '../utils'
import { fetchCart } from "../store/actions/cart"

class ProductDetail extends React.Component {
	state = {
		loading: false,
		error: null,
		formVisible: false,
		data: [],
		formData: {},
		selectedColor: null,
	};

	componentDidMount() {
		this.handleFetchItem();
	}

	handleToggleForm = () => {
		const {formVisible} = this.state;
		this.setState({
			formVisible: !formVisible
		});
	}

	handleFetchItem = () => {
		const {match: { params }} = this.props
		this.setState({ loading: true});
		axios
			.get(productDetailURL(params.productID))
			.then(res => {
				this.setState({ data: res.data, loading: false });
				console.log(res.data);
			})
			.catch(err => {
				this.setState({ error: err, loading: false });
			});
	};

	handleFormatData = formData => {
		return Object.keys(formData).map(key => {
			return formData[key];
		})
	}

	handleAddToCart = slug => {
		this.setState({ loading: false })
		const {formData} = this.state;
		const variations = this.handleFormatData(formData);

		authAxios
		.post(addToCartURL, {slug, variations})
			.then(res => {
				this.props.refreshCart();
				this.setState({ loading: false});
			})
			.catch(err => {
				this.setState({ error: err, loading: false });
			});
	}

	handleChange = (e, {name, value}) => {
		const {formData} = this.state;
		const updatedFormData = {
			...formData,
			[name]:value
		};
		this.setState({formData: updatedFormData});
		// console.log(value)
		if (name === 'color') {
			this.setState({selectedColor: value}, () => {
				const {formData, selectedColor} = this.state
				console.log(selectedColor)
				console.log(formData)
			})
		}
	}

	render() {
		const { data, error, loading, formVisible, formData, selectedColor } = this.state;
		const item = data;
		const picChange = () => {
			var newPic;
			// console.log(item.variations[0])
			const colorVariations = item.variations[0]
			colorVariations.item_variations.map(iv => {
				if (iv.id === selectedColor) {
					newPic = iv.attachment;
					// console.log(newPic);
				}
				return newPic
			})
				return `http://localhost:8000${newPic}`
			}

		return (
			<Container>
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
				<Grid columns={2} divided>
					<Grid.Row>
						<Grid.Column>
							<Card fluid>
								<Image src={selectedColor === null ? item.image : picChange()} />
								{/* <Image src={item.image} /> */}
								<Card.Content>
									<Card.Header>
										{item.name}
									</Card.Header>
									<Card.Header>
										
									</Card.Header>
									<Card.Meta>{item.category}</Card.Meta>
									<Card.Description>
										{item.description}
										{item.discount_price && (
											<Label as='a' tag style={{float:'right'}}
												color={ // if the item's label is primary, blue. Elif label secondary, green. Else, olive.
													item.label === 'primary' 
														? 'blue' 
														: item.label === 'secondary' 
														? 'green' 
														: 'olive' 
												}
											>
												${item.discount_price}
												
											</Label>
										)}
										{!item.discount_price && (
											<Label as='a' tag style={{float:'right'}}
												color={ // if the item's label is primary, blue. Elif label secondary, green. Else, olive.
													item.label === 'primary' 
														? 'blue' 
														: item.label === 'secondary' 
														? 'green' 
														: 'olive' 
												}
											>
												${item.price}
											</Label>
										)}		
									</Card.Description>
								</Card.Content>
								<Card.Content>
									<Button
										color="yellow"
										floated="right"
										icon
										labelPosition="right"
										onClick={this.handleToggleForm}
									>
										Add to cart
										<Icon name="cart plus" />
									</Button>
								</Card.Content>
							</Card>
							{formVisible && (
								<Fragment>
									<Divider />
									<Form>
										{data.variations.map(v => {
											const name = v.name.toLowerCase();
											return (
												<Form.Field key={v.id}>
													<Select
														name={name}
														onChange={this.handleChange}
														options={v.item_variations.map(item => {
															return { 
																key: item.id,
																text: item.value,
																value: item.id
															}
														})}
														placeholder={v.name}
														selection
														value={formData[name]}
													/>
												</Form.Field>
											)
										})}
										
										<Form.Button style={{float:'right'}} primary onClick={() => this.handleAddToCart(item.slug)}>
											Submit
										</Form.Button>	
										
									</Form>
								</Fragment>
							)}
							
							
						</Grid.Column>
						<Grid.Column>
							<Header as='h2'>Choose a Style</Header>
							{data.variations && (
								data.variations.map(v => {
									return (
										<Fragment key={v.id}>
											<Header as='h3'>{v.name}</Header>
											<Item.Group divided>
												{v.item_variations.map(iv => {
													return (
														<Item key={iv.id}>
															{iv.attachment && (
																<Item.Image src={`http://localhost:8000${iv.attachment}`} />
															)}
															<Item.Content verticalAlign='middle'>{iv.value}</Item.Content>
														</Item>
													);
												})}
											</Item.Group>
										</Fragment>
									)
								})	
							)}
						</Grid.Column>
					</Grid.Row>
				</Grid>
			</Container>
		);
	}
}

// includes dispatch action in Props
const mapDispatchToProps = dispatch => {
	return {
	  refreshCart: () => dispatch(fetchCart())
	};
 };
 
 export default withRouter(
	 connect(
		// null instead of mapStateToProps
		null,
		mapDispatchToProps
 	)(ProductDetail)
 );
 