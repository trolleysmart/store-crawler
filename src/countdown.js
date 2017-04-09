Parse.Cloud.job('Countdown', function (request, status) {
  status.message('The job has started.');
  status.success('The job has finished.');
});
