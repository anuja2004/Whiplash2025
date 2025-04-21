// @desc Get notes by course and topic
// @route GET /api/notes
// @access Private
export const getNotes = async (req, res, next) => {
    try {
      const { courseId, topicId } = req.query;
      
      const query = {
        user: req.user.id,
        course: courseId
      };
      
      if (topicId) {
        query.topic = topicId;
      }
      
      const notes = await Note.find(query).sort({ updatedAt: -1 });
      
      res.status(200).json({
        success: true,
        count: notes.length,
        data: notes
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  };
  
  // @desc Create a note
  // @route POST /api/notes
  // @access Private
  export const createNote = async (req, res, next) => {
    try {
      req.body.user = req.user.id;
      
      const note = await Note.create(req.body);
      
      res.status(201).json({
        success: true,
        data: note
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  };
  
  // @desc Update a note
  // @route PUT /api/notes/:id
  // @access Private
  export const updateNote = async (req, res, next) => {
    try {
      let note = await Note.findById(req.params.id);
      
      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }
      
      // Make sure user owns the note
      if (note.user.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to update this note'
        });
      }
      
      // Update timestamp
      req.body.updatedAt = Date.now();
      
      note = await Note.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
      
      res.status(200).json({
        success: true,
        data: note
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  };
  
  /**
   * @desc Delete a note
   * @route DELETE /api/notes/:id
   * @access Private
   */
  export const deleteNote = async (req, res, next) => {
    try {
      const note = await Note.findById(req.params.id);
      
      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }
      
      // Make sure user owns the note
      if (note.user.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to delete this note'
        });
      }
      
      // Updated to use deleteOne() instead of remove() which is deprecated
      await note.deleteOne();
      
      res.status(200).json({
        success: true,
        data: {}
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
    }
  };