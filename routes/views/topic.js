var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'topic';
	locals.filters = {
		topic: req.params.topic
	};
	locals.data = {
		topic: {}
	};

  // Load the current topic
	view.on('init', function(next) {

		if (locals.filters.topic) {
			keystone.list('ExplanationTopic').model.findOne({ slug: locals.filters.topic }).exec(function(err, result) {
				if(result) {
					locals.data.topic = result;
				}
				next(err);
			});
		} else {
			next();
		}

	});

	// Load the explanations
	view.on('init', function(next) {

		var q = keystone.list('Explanation').paginate({
				page: req.query.page || 1,
				perPage: 25,
				maxPages: 10
			})
			.where('state', 'published')
			.sort('name');

		if (locals.data.topic) {
			q.where('topic').in([locals.data.topic]);
		}

		q.exec(function(err, results) {
			locals.data.explanations = results;
			next(err);
		});

	});

	// Render the view
	view.render('topic');
};
