import queryString from 'query-string';

export default async function frappe_request_call(opts) {
  frappe.request.prepare(opts);

  let data;
  const url = getUrl(opts);
  const req = new Request(url, {
    method: opts.type,
    headers: getHeaders(opts),
    body: getBody(opts),
  });

  try {
    const res = await fetch(req);
    data = await res.json();

    // sync attached docs
    if (data.docs || data.docinfo) {
      frappe.model.sync(data);
    }

    // sync translated messages
    if (data.__messages) {
      frappe._messages = Object.assign(frappe._messages, data.__messages);
    }

    // callbacks
    const status_code_handler = getStatusHandler(opts, res.status);
    try {
      if (status_code_handler) {
        status_code_handler(data);
      } else if (!res.ok && opts.error_callback) {
        opts.error_callback(data);
      }
    } catch (e) {
      console.log(
        res.ok
          ? 'Unable to handle success response'
          : 'Unable to handle failed response'
      );
      console.trace(e);
    }

    return data;
  } finally {
    frappe.request.cleanup(opts, data);
    if (opts.always) {
      opts.always(data);
    }
  }
}

function getUrl(opts) {
  const url = new URL(opts.url || frappe.request.url, window.location.origin);
  if (opts.type === 'GET' && opts.args) {
    Object.keys(opts.args).forEach(p => {
      url.searchParams.append(p, opts.args[p]);
    });
  }
  return url;
}

function getHeaders(opts) {
  return Object.assign(
    {
      'X-Frappe-CSRF-Token': frappe.csrf_token,
      Accept: 'application/json',
      'X-Frappe-CMD': (opts.args && opts.args.cmd) || '',
    },
    !opts.dataType && {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    opts.headers,
    opts.args && opts.args.doctype && { 'X-Frappe-Doctype': opts.args.doctype }
  );
}

function getBody(opts) {
  if (opts.type === 'GET') {
    return null;
  }
  if (!opts.dataType) {
    return queryString.stringify(opts.args);
  }
  return JSON.stringify(opts.args);
}

function getStatusHandler(opts, status) {
  const handlers = {
    200: function (data) {
      opts.success_callback && opts.success_callback(data, JSON.stringify(data));
    },
    401: function () {
      if (
        frappe.app.session_expired_dialog &&
        frappe.app.session_expired_dialog.display
      ) {
        frappe.app.redirect_to_login();
      } else {
        frappe.app.handle_session_expired();
      }
    },
    404: function () {
      frappe.msgprint({
        title: __('Not found'),
        indicator: 'red',
        message: __('The resource you are looking for is not available'),
      });
    },
    403: function (data) {
      if (frappe.get_cookie('sid') === 'Guest') {
        // session expired
        frappe.app.handle_session_expired();
        return;
      }
      if (data && data._error_message) {
        frappe.msgprint({
          title: __('Not permitted'),
          indicator: 'red',
          message: data._error_message,
        });

        return;
      }
      frappe.msgprint({
        title: __('Not permitted'),
        indicator: 'red',
        message: __(
          'You do not have enough permissions to access this resource. Please contact your manager to get access.'
        ),
      });
    },
    508: function () {
      frappe.utils.play_sound('error');
      frappe.msgprint({
        title: __('Please try again'),
        indicator: 'red',
        message: __(
          'Another transaction is blocking this one. Please try again in a few seconds.'
        ),
      });
    },
    413: function () {
      frappe.msgprint({
        indicator: 'red',
        title: __('File too big'),
        message: __('File size exceeded the maximum allowed size of {0} MB', [
          (frappe.boot.max_file_size || 5242880) / 1048576,
        ]),
      });
    },
    417: function (data) {
      opts.error_callback && opts.error_callback(data);
    },
    501: function (data) {
      opts.error_callback && opts.error_callback(data, JSON.stringify(data));
    },
    500: function (data) {
      frappe.utils.play_sound('error');
      try {
        opts.error_callback && opts.error_callback();
        frappe.request.report_error(data, opts);
      } catch (e) {
        frappe.request.report_error(data, opts);
      }
    },
    504: function () {
      frappe.msgprint(__('Request Timed Out'));
      opts.error_callback && opts.error_callback();
    },
    502: function () {
      frappe.msgprint(__('Internal Server Error'));
    },
  };

  return handlers[status];
}
