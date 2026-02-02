const sequelize = require('../config/database');
const User = require('./User');
const BlogPost = require('./BlogPost');
const DraftPost = require('./DraftPost');
const Comment = require('./Comment');
const Subscriber = require('./Subscriber');
const ContactForm = require('./ContactForm');

// Define associations

// User has many BlogPosts
User.hasMany(BlogPost, { 
  foreignKey: 'userId', 
  as: 'posts' 
});
BlogPost.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'author' 
});

// User has many DraftPosts
User.hasMany(DraftPost, { 
  foreignKey: 'userId', 
  as: 'drafts' 
});
DraftPost.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'author' 
});

// BlogPost has many Comments
BlogPost.hasMany(Comment, { 
  foreignKey: {
    name: 'postId',
    field: 'post_id'
  },
  as: 'comments',
  onDelete: 'CASCADE',
  hooks: true
});

Comment.belongsTo(BlogPost, { 
  foreignKey: {
    name: 'postId',
    field: 'post_id'
  },
  as: 'post' 
});

// User has many Comments
User.hasMany(Comment, { 
  foreignKey: 'userId', 
  as: 'comments' 
});
Comment.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'author' 
});

module.exports = {
  sequelize,
  User,
  BlogPost,
  DraftPost,
  Comment,
  Subscriber,
  ContactForm
};
