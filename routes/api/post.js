const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

// Load Post Model
const Post = require('../../model/Post');

// Load post validator
const validatePostInput = require('../../validation/post');
const Profile = require('../../model/Profile');


//  @route   POST api/post
// @desc     create/add a post
// @access  private

router.post(
	'/',
	passport.authenticate('jwt', {
		session: false,
	}),
	(req, res) => {
		const {
			errors,
			isValid
		} = validatePostInput(req.body);
		if (!isValid) {
			return res.status(400).json(errors);
		}
		const newPost = new Post({
			name: req.user.name,
			text: req.body.text,
			avatar: req.user.avatar,
			user: req.user.id,
		});
		newPost.save().then((post) => res.json(post));
	}
);

//  @route   GET api/posts
// @desc     get all post
// @access  public

router.get('/', (req, res) => {
	Post.find()
		.sort({
			date: -1,
		})
		.then((posts) => res.json(posts))
		.catch((err) =>
			res.status(400).json({
				posts: 'posts  not found',
			})
		);
});

//  @route   GET api/posts/post_id
// @desc     get post bi id
// @access  public

router.get('/:post_id', (req, res) => {
	Post.findById({
			_id: req.params.post_id,
		})
		.then((post) => res.json(post))
		.catch((err) =>
			res.status(404).json({
				post: 'post  not found with that ID',
			})
		);
});

//  @route   DELETE api/posts/post_id
// @desc     delete post by owner
// @access  private

router.delete(
	'/:post_id',
	passport.authenticate('jwt', {
		session: false,
	}),
	(req, res) => {
		Post.findById(req.params.post_id)
			.then((post) => {
				if (post.user.toString() !== req.user.id) {
					return res.status(401).json({
						post: 'user is not authorized',
					});
				}
				post.remove().then(() =>
					res.json({
						success: true,
					})
				);
			})
			.catch((err) =>
				res.status(404).json({
					post: 'no post found ',
				})
			);
	}
);

// @Route    POST api/post/like/:post_id
// @Desc      like a post
// @Access   private
router.post(
	'/like/:post_id',
	passport.authenticate('jwt', {
		session: false,
	}),
	(req, res) => {
		Profile.findOne({
				user: req.user.id,
			})
			.then((profile) => {
				Post.findById(req.params.post_id)
					.then((post) => {
						//check user liked this post?
						if (
							post.likes.filter((like) => like.user.toString() === req.user.id)
							.length > 0
						) {
							return res.status(400).json({
								useralreadyliked: 'you+ has already liked this post',
							});
						}
						// save the like
						post.likes.unshift({
							user: req.user.id,
						});

						post.save().then((post) => res.json(post));
					})
					.catch((err) =>
						res.status(404).json({
							post: 'post not found',
						})
					);
			})
			.catch((err) =>
				res.status(404).json({
					profile: 'profile not found',
				})
			);
	}
);

// @Route    POST api/post/unlike/:post_id
// @Desc      unlike a post
// @Access   private
router.delete(
	'/unlike/:post_id',
	passport.authenticate('jwt', {
		session: false,
	}),
	(req, res) => {
		Profile.findOne({
				user: req.user.id,
			})
			.then((profile) => {
				Post.findById(req.params.post_id)
					.then((post) => {
						//check user liked this post?
						if (
							post.likes.filter((like) => like.user.toString() === req.user.id)
							.length === 0
						) {
							return res.status(400).json({
								notliked: 'you have not liked this post yet',
							});
						}
						// remove the like
						const removeIndex = post.likes
							.map((item) => item.user.toString())
							.indexOf(req.user.id);
						post.likes.splice(removeIndex, 1);

						post.save().then((post) => res.json(post));
					})
					.catch((err) =>
						res.status(404).json({
							post: 'post not found',
						})
					);
			})
			.catch((err) =>
				res.status(404).json({
					profile: 'profile not found',
				})
			);
	}
);

//  @route   POST /api/post/comment/:post_id
//  @desc    add comment to the post
//  @access  private

router.post(
	'/comment/:post_id',
	passport.authenticate('jwt', {
		session: false,
	}),
	(req, res) => {
		Profile.findOne({
				user: req.user.id,
			})
			.then((profile) => {
				Post.findById({
						_id: req.params.post_id,
					})
					.then((post) => {
						const newComment = {
							user: req.user.id,
							avatar: req.user.avatar,
							name: req.user.name,
							text: req.body.text,
						};
						post.comments.unshift(newComment);
						post.save().then((post) => res.json(post));
					})
					.catch((err) =>
						res.status(404).json({
							post: 'post not found',
							id: req.params.post_id,
						})
					);
			})
			.catch((err) =>
				res.status(404).json({
					user: 'user not found',
				})
			);
	}
);

//  @route   DELETE /api/post/comment/:post_id/:commnet_id
//  @desc    delete comment to the post
//  @access  private

router.delete(
	'/comment/:post_id/:comment_id',
	passport.authenticate('jwt', {
		session: false,
	}),
	(req, res) => {
		Profile.findOne({
				user: req.user.id,
			})
			.then((profile) => {
				// finding the post
				Post.findById(req.params.post_id)
					.then((post) => {
						// finding the comment
						if (
							!post.comments.filter(
								(comment) => comment._id.toString() === req.params.comment_id
							).length > 0
						) {
							return res.status(404).json({
								comment: 'comment not found'
							});
						}


						// find the index of comment
						const removeIndex = post.comments
							.map((item) => item._id.toString())
							.indexOf(req.params.comment_id);


						// check user in owener or not
						// only post owner or comment owner can delete
						if (
							!post.user.toString() === req.user.id ||
							!post.comments[removeIndex].user.toString() === req.user.id
						) {
							return res.status(401).json({
								post: 'user is not authorized',
								removeIdx: removeIndex
							});
						}

						post.comments.splice(removeIndex, 1);
						post.save().then((post) => res.json(post));

					})
					.catch((err) =>
						res.status(404).json({
							post: 'post not found',
						})
					);
			})
			.catch((err) =>
				res.status(404).json({
					user: 'user not found',
				})
			);
	}
);



//  @route   POST /api/post/comment/like/:post_id/:commnet_id
//  @desc    add like to comment
//  @access  private

router.post(
	'/comment/like/:post_id/:comment_id',
	passport.authenticate('jwt', {
		session: false,
	}),
	(req, res) => {
		Profile.findOne({
				user: req.user.id,
			})
			.then((profile) => {
				// finding the post
				Post.findById(req.params.post_id)
					.then((post) => {
						// finding the comment
						if (
							!post.comments.filter(
								(comment) => comment._id.toString() === req.params.comment_id
							).length > 0
						) {
							return res.status(404).json({
								comment: 'comment not found'
							});
						}

						// find the index of comment
						const commnetIndex = post.comments
							.map((item) => item._id.toString())
							.indexOf(req.params.comment_id);

						//check user liked this post?
						if (
							post.comments[commnetIndex].likes.filter((like) => like.user.toString() === req.user.id)
							.length > 0
						) {
							return res.status(400).json({
								useralreadyliked: 'you+ has already liked this post',
							});
						}

						// save the like
						post.comments[commnetIndex].likes.unshift({
							user: req.user.id,
						});

						post.save().then((post) => res.json(post));

					})
					.catch((err) =>
						res.status(404).json({
							post: 'post not found',
						})
					);
			})
			.catch((err) =>
				res.status(404).json({
					user: 'user not found',
				})
			);
	}
);

//  @route   DELETE /api/post/comment/unlike/:post_id/:commnet_id
//  @desc    remove like to comment or unlike the comment
//  @access  private



router.delete(
	'/comment/unlike/:post_id/:comment_id',
	passport.authenticate('jwt', {
		session: false,
	}),
	(req, res) => {
		Profile.findOne({
				user: req.user.id,
			})
			.then((profile) => {
				Post.findById(req.params.post_id)
					.then((post) => {

						// finding the comment
						if (
							!post.comments.filter(
								(comment) => comment._id.toString() === req.params.comment_id
							).length > 0
						) {
							return (res.status(404).json({
								comment: 'comment not found'
							}));
						}

						// find comment index
						const commentIndex = post.comments.map(item => item.id.toString()).indexOf(req.params.comment_id);

						//check user liked this post?
						if (
							post.comments[commentIndex].likes.filter((like) => like.user.toString() === req.user.id)
							.length === 0
						) {
							return res.status(400).json({
								notliked: 'you have not liked this comment yet',
							});
						}
						// remove the like
						const removeIndex = post.comments[commentIndex].likes
							.map((item) => item.user.toString())
							.indexOf(req.user.id);
						post.comments[commentIndex].likes.splice(removeIndex, 1);

						post.save().then((post) => res.json(post));
					})
					.catch((err) =>
						res.status(404).json({
							post: 'post not found',
						})
					);
			})
			.catch((err) =>
				res.status(404).json({
					profile: 'profile not found',
				})
			);
	}
);

module.exports = router;