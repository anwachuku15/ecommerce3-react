import React, { Fragment } from 'react'
// Router gives us access to match properties that allow us to access url parameters
import { withRouter } from 'react-router-dom'
// React-Redux connects actions to the component
import { connect } from "react-redux";

import axios from 'axios'
import { Button, Container, Card, Dimmer, Grid, Header, Icon, Image, Item, Label, Loader, Message, Segment, GridColumn } from 'semantic-ui-react'
import { productDetailURL, addToCartURL } from '../URLconstants'
import { authAxios } from '../utils'
import { fetchCart } from "../store/actions/cart"

class ProductDetail extends React.Component {
	state = {
		loading: false,
		error: null,
		data: [],
		order: []
	};

	componentDidMount() {
		this.handleFetchItem();
		
	}

	handleFetchItem = () => {
		const {match: { params }} = this.props
		this.setState({ loading: true});
		axios
			.get(productDetailURL(params.productID))
			.then(res => {
				this.setState({ data: res.data, loading: false });
			})
			.catch(err => {
				this.setState({ error: err, loading: false });
			});
	};

	handleAddToCart = slug => {
		this.setState({ loading: false })
		// Need to include auth token to make post requests from the API (utils.js)
		authAxios
		.post(addToCartURL, {slug})
			.then(res => {
				this.props.refreshCart();
				this.setState({ loading: false});
			})
			.catch(err => {
				this.setState({ error: err, loading: false });
			});
	}

	render() {
		const { data, error, loading } = this.state;
		const item = data;
		// console.log();
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
							<Card
								fluid
								image={item.image}
								header={item.name}
								meta={item.category}
								description={item.description}
								extra={
									<Fragment>
										<Button
											color="yellow"
											floated="right"
											icon
											labelPosition="right"
											onClick={() => this.handleAddToCart(item.slug)}
										>
											Add to cart
											<Icon name="cart plus" />
										</Button>
										{item.discount_price && (
											<Label as='a' tag 
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
											<Label as='a' tag
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
									</Fragment>
								}
							/>
						</Grid.Column>
						<Grid.Column>
							<Header as='h2'>Choose a Style</Header>
							{data.variations && (
								data.variations.map(v => {
									return (
										<Fragment>
											<Header as='h3'>{v.name}</Header>
											<Item.Group key={v.id} divided>
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
 