import React from 'react'
import axios from 'axios'
import { Button, Container, Dimmer, Icon, Image, Item, Label, Loader, Message, Segment } from 'semantic-ui-react'
import { productListURL } from '../constants'


class ProductList extends React.Component {
	state = {
		loading: false,
		error: null,
		data: []
	};

	componentDidMount() {
		this.setState({ loading: true })
		// Use normal Axios request because user doesn't need to be authenticated to view Product List
		axios
		.get(productListURL)
		.then(res => {
			this.setState({ data: res.data, loading: false});
			console.log(res.data)
		})
		.catch(err => {
			this.setState({ error: err, loading: false });
		});
	}

	render() {
		const { data, error, loading } = this.state;
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
						return <Item key={item.id}>
							<Item.Image src={item.image} />
							<Item.Content>
								<Item.Header as='a'>{item.name}</Item.Header>
								<Item.Meta>
								<span className='cinema'>{item.category}</span>
								</Item.Meta>
								<Item.Description>{item.description}</Item.Description>
								<Item.Extra>
								<Button primary floated='right' icon labelPosition='right'>
									Add to Cart
									<Icon name='add to cart' />
								</Button>
								{item.discount_price && (
									<Label 
										color={ // if the item's label is primary, blue. Elif label secondary, green. Else, olive.
											item.label === 'primary' 
												? 'blue' 
												: item.label === 'secondary' 
												? 'green' 
												: 'olive' 
										}
									>
										{item.discount_price}
									</Label>
								)} 
								</Item.Extra>
							</Item.Content>
						</Item>

					})}
						
				</Item.Group>
			</Container>
		);
	}
}

export default ProductList