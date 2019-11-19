import React from 'react'

// React-Redux connects actions to the component
import { connect } from "react-redux";

import axios from 'axios'
import { Button, Container, Dimmer, Icon, Image, Item, Label, Loader, Message, Segment } from 'semantic-ui-react'
import { productListURL, addToCartURL } from '../URLconstants'
import { authAxios } from '../utils'
import { fetchCart } from "../store/actions/cart"

class ProductList extends React.Component {
	state = {
		loading: false,
		error: null,
		data: [],
		order: []
	};

	// componentDidMount() gets retrieves data to be loaded on this page
	componentDidMount() {
		console.log(this.props);

		this.setState({ loading: true })
		// Use normal Axios request because user doesn't need to be authenticated to view Product List
		axios
		.get(productListURL)
		.then(res => {
			console.log(res.data);
			this.props.refreshCart();
			this.setState({ data: res.data, loading: false});
		})
		.catch(err => {
			this.setState({ error: err, loading: false });
		});
		
	}

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

				<Item.Group divided>
					{data.map(item => {
						return (
							<Item key={item.id}>
								<Item.Image src={item.image} />
								<Item.Content>
									<Item.Header as='a'>{item.name}</Item.Header>
									<Item.Meta>
										<span className='cinema'>{item.category}</span>
									</Item.Meta>
									<Item.Description>{item.description}</Item.Description>
									<Item.Extra>
										<Button primary floated='right' icon labelPosition='right' onClick={() => this.handleAddToCart(item.slug)}>
											Add to Cart
											<Icon name='add to cart' />
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
									</Item.Extra>
								</Item.Content>
							</Item>
						);
					})}	
				</Item.Group>
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
 
 export default connect(
	// null instead of mapStateToProps
	null,
	mapDispatchToProps
 )(ProductList);
 