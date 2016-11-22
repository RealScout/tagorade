var React = require('react');
var _ = require('lodash');
var Mousetrap = require('mousetrap');
var EventEmitter = require("events").EventEmitter;
var assign = require('object-assign');

////////////////////////////////////////////////////
// Keyboard Shortcuts and Legend ///////////////////
////////////////////////////////////////////////////

var ShortCutLegend = React.createClass({
  componentDidMount: function() {
    _.forEach(window.config.keyboardShortcuts, function(tag, shortcut){
      Mousetrap.bind(shortcut, function() {
        TagStore.add(tag)
      });
    });
    Mousetrap.bind('space', function() { TagStore.add('Skipped') });
    Mousetrap.bind('x', function() { TagStore.pop() });
  },
  render: function() {
    var shortcutDescriptions = [];
    _.forEach(this.props.shortcuts, function(tag, shortcut){
      shortcutDescriptions.push(<li><strong>{shortcut}</strong>: {tag}</li>);
    });
    return <div className='shortcut-legend'>
      <ul>
        <h4>Keyboard Shortcut Legend</h4>
        {shortcutDescriptions}
        <h4>Other Shortcuts</h4>
        <p>To <em>skip</em> an image, press the <code>space bar</code>.</p>
        <p>To <em>go back and undo</em> your previous selection, press the <code>x</code> key.</p>
      </ul>
    </div>
  }
});

////////////////////////////////////////////////////
// TagStore ////////////////////////////////////////
////////////////////////////////////////////////////

var CHANGE_EVENT = 'change';
var REMOVE_EVENT = 'remove';
var TagStore = assign({}, EventEmitter.prototype, {
  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },
  emitRemove: function() {
    this.emit(REMOVE_EVENT);
  },
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },
  addRemoveListener: function(callback) {
    this.on(REMOVE_EVENT, callback);
  },
  add: function(tag) {
    window.tags.push(tag);
    this.emitChange();
  },
  pop: function() {
    window.tags.pop();
    this.emitRemove();
  }
});

// Set initial state by randomly selecting 50 photos from ./photos.js
window.tags = [];
function getTagState() {
  return {
    tags: window.tags,
    photos: window.photos,
    isFinished: window.tags.length === window.photos.length
  };
}

////////////////////////////////////////////////////
// Header Photo Carousel ///////////////////////////
////////////////////////////////////////////////////

var getPhotoImgSrc = function(photo) {
  return photo ? photo.url : '';
};

var PhotoList = React.createClass({
  render: function() {
    var currentIndex = this.props.tags.length;

    // Grab the last 3 tagged photos and create a Photo component for each
    var taggedPhotos = [];
    for (var i=currentIndex-3; i < currentIndex; i++) {
        taggedPhotos.push(<Photo src={getPhotoImgSrc(this.props.photos[i])} tag={this.props.tags[i]}/>);
    }

    // Grab the currentPhoto
    var currentPhoto = <Photo src={getPhotoImgSrc(this.props.photos[currentIndex])} isCurrent='true'/>;

    // Grab the next 3 photos and create a Photo component for each
    var upcomingPhotos = [];
    for (var i=currentIndex+1; i < currentIndex+4; i++) {
        upcomingPhotos.push(<Photo src={getPhotoImgSrc(this.props.photos[i])}/>);
    }

    return <div className='photo-context-slide'>
      {taggedPhotos}
      {currentPhoto}
      {upcomingPhotos}
    </div>;
  }
});

var Photo = React.createClass({
  render: function() {
    // Compile class string based on passed in props
    var classString = 'photo-context-item';
    if (this.props.isCurrent) {
      classString += ' current';
    }
    if (this.props.tag) {
      classString += ' tagged';
    }

    // Add &nbsp; if we don't have a tag
    var tag = this.props.tag || '\u0020';

    return <div className={classString}>
      <span className='tag'>{this.props.isCurrent ? 'Currently Viewing' : tag}</span>
      <div className='image'>
      <img src={this.props.src}/>
      </div>
    </div>
  }
});

////////////////////////////////////////////////////
// Main TagScout App ///////////////////////////////
////////////////////////////////////////////////////


var TagScout = React.createClass({
  getInitialState: function() {
    return getTagState();
  },
  componentDidMount: function() {
    TagStore.addChangeListener(this._onChange);
    TagStore.addRemoveListener(this._onRemove);
  },
  _onRemove: function() {
    var tagState = getTagState();
    this.setState(tagState);
  },
  _onChange: function() {
    // update state with justTaggedIndex to trigger render
    var currentIndex = this.state.tags.length;
    var tagState = getTagState();
    tagState.justTaggedIndex = currentIndex - 1;
    this.setState(tagState);



    // Remove justTaggedIndex from state to trigger a delayed render
    setTimeout(function(){
      this.setState({
        justTaggedIndex: undefined
      });
    }.bind(this), 250);
  },
  submitForm: function() {
    if (window.config.formAction === null) {
      var that = this;
        _.forEach(this.state.photos, function(photo, index){
        console.log(photo.id + ',' + that.state.tags[index]);
      });
    }
    else {
      var form = document.mturk_form;
      form.submit();
    }


  },
  render: function() {
    var self = this;
    var currentIndex = this.state.tags.length;
    var justTaggedTag, currentPhoto;

    // If justTaggedIndex is set, grab the tag name and
    // set currentPhoto to photo that was just tagged
    if (typeof this.state.justTaggedIndex !== 'undefined') {
      justTaggedTag = this.state.tags[this.state.justTaggedIndex];
      currentPhoto = this.state.photos[this.state.justTaggedIndex]
    }
    else {
      currentPhoto = this.state.photos[currentIndex]
    }

    if (this.state.isFinished) {
      Mousetrap.bind('enter', function() { self.submitForm()});
    }
    else {
      Mousetrap.unbind('enter');
    }

    return <div className="row">
      <div className="small-7 columns photos-container">
        <PhotoList tags={this.state.tags} photos={this.state.photos}/>
        <div className='currently-reviewing'>
          <img src={currentPhoto ? currentPhoto.url : ''}/>
          <span className='just-tagged-tag'>{justTaggedTag}</span>
          <span className='just-tagged-tag' style={{"zIndex": -1}}>{this.state.isFinished ? 'Press Enter to Submit HIT' : ''}</span>
        </div>
      </div>
      <div className="small-4 small-offset-1 columns">
        <h3>Classify Images</h3>
        <p>Please select a category (shown below) for each of the images in the list. Pressing a key will select the corresponding category and automatically move you to the next image.</p>
        <ShortCutLegend shortcuts={window.config.keyboardShortcuts}/>
      </div>
      <form name='mturk_form' method='post' id='mturk_form' action={window.config.formAction}>
        <input type='hidden' value={turkGetParam('assignmentId', "")} name='assignmentId' id='assignmentId'/>
        {this.state.photos.map(function(photo, i) {
          return <div>
            <input type='hidden' value={self.state.tags[i]} name={'tag'+i} />
            <input type='hidden' value={photo.id} name={'id'+i} />
            <input type='hidden' value={photo.url} name={'url'+i} />
          </div>
        })}
      </form>
    </div>;
  }
});

React.render(<TagScout />,  document.getElementById('container'));
