<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <title>Laravel API Documentation</title>

    <link href="https://fonts.googleapis.com/css?family=Open+Sans&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="{{ asset("/vendor/scribe/css/theme-default.style.css") }}" media="screen">
    <link rel="stylesheet" href="{{ asset("/vendor/scribe/css/theme-default.print.css") }}" media="print">

    <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.10/lodash.min.js"></script>

    <link rel="stylesheet"
          href="https://unpkg.com/@highlightjs/cdn-assets@11.6.0/styles/obsidian.min.css">
    <script src="https://unpkg.com/@highlightjs/cdn-assets@11.6.0/highlight.min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jets/0.14.1/jets.min.js"></script>

    <style id="language-style">
        /* starts out as display none and is replaced with js later  */
                    body .content .bash-example code { display: none; }
                    body .content .javascript-example code { display: none; }
            </style>

    <script>
        var tryItOutBaseUrl = "http://toolsync.test";
        var useCsrf = Boolean();
        var csrfUrl = "/sanctum/csrf-cookie";
    </script>
    <script src="{{ asset("/vendor/scribe/js/tryitout-5.6.0.js") }}"></script>

    <script src="{{ asset("/vendor/scribe/js/theme-default-5.6.0.js") }}"></script>

</head>

<body data-languages="[&quot;bash&quot;,&quot;javascript&quot;]">

<a href="#" id="nav-button">
    <span>
        MENU
        <img src="{{ asset("/vendor/scribe/images/navbar.png") }}" alt="navbar-image"/>
    </span>
</a>
<div class="tocify-wrapper">
    
            <div class="lang-selector">
                                            <button type="button" class="lang-button" data-language-name="bash">bash</button>
                                            <button type="button" class="lang-button" data-language-name="javascript">javascript</button>
                    </div>
    
    <div class="search">
        <input type="text" class="search" id="input-search" placeholder="Search">
    </div>

    <div id="toc">
                    <ul id="tocify-header-introduction" class="tocify-header">
                <li class="tocify-item level-1" data-unique="introduction">
                    <a href="#introduction">Introduction</a>
                </li>
                            </ul>
                    <ul id="tocify-header-authenticating-requests" class="tocify-header">
                <li class="tocify-item level-1" data-unique="authenticating-requests">
                    <a href="#authenticating-requests">Authenticating requests</a>
                </li>
                            </ul>
                    <ul id="tocify-header-analytics" class="tocify-header">
                <li class="tocify-item level-1" data-unique="analytics">
                    <a href="#analytics">Analytics</a>
                </li>
                                    <ul id="tocify-subheader-analytics" class="tocify-subheader">
                                                    <li class="tocify-item level-2" data-unique="analytics-GETapi-analytics-overview">
                                <a href="#analytics-GETapi-analytics-overview">Get analytics overview</a>
                            </li>
                                                                        </ul>
                            </ul>
                    <ul id="tocify-header-dashboard" class="tocify-header">
                <li class="tocify-item level-1" data-unique="dashboard">
                    <a href="#dashboard">Dashboard</a>
                </li>
                                    <ul id="tocify-subheader-dashboard" class="tocify-subheader">
                                                    <li class="tocify-item level-2" data-unique="dashboard-GETapi-dashboard">
                                <a href="#dashboard-GETapi-dashboard">Get dashboard overview</a>
                            </li>
                                                                        </ul>
                            </ul>
                    <ul id="tocify-header-endpoints" class="tocify-header">
                <li class="tocify-item level-1" data-unique="endpoints">
                    <a href="#endpoints">Endpoints</a>
                </li>
                                    <ul id="tocify-subheader-endpoints" class="tocify-subheader">
                                                    <li class="tocify-item level-2" data-unique="endpoints-GETapi-user">
                                <a href="#endpoints-GETapi-user">GET api/user</a>
                            </li>
                                                                        </ul>
                            </ul>
                    <ul id="tocify-header-tool-allocation-history" class="tocify-header">
                <li class="tocify-item level-1" data-unique="tool-allocation-history">
                    <a href="#tool-allocation-history">Tool Allocation History</a>
                </li>
                                    <ul id="tocify-subheader-tool-allocation-history" class="tocify-subheader">
                                                    <li class="tocify-item level-2" data-unique="tool-allocation-history-GETapi-tool-allocations-history">
                                <a href="#tool-allocation-history-GETapi-tool-allocations-history">List allocation history</a>
                            </li>
                                                                        </ul>
                            </ul>
                    <ul id="tocify-header-tool-allocations" class="tocify-header">
                <li class="tocify-item level-1" data-unique="tool-allocations">
                    <a href="#tool-allocations">Tool Allocations</a>
                </li>
                                    <ul id="tocify-subheader-tool-allocations" class="tocify-subheader">
                                                    <li class="tocify-item level-2" data-unique="tool-allocations-GETapi-tool-allocations">
                                <a href="#tool-allocations-GETapi-tool-allocations">List all tool allocations</a>
                            </li>
                                                                                <li class="tocify-item level-2" data-unique="tool-allocations-POSTapi-tool-allocations">
                                <a href="#tool-allocations-POSTapi-tool-allocations">Create a tool allocation</a>
                            </li>
                                                                                <li class="tocify-item level-2" data-unique="tool-allocations-GETapi-tool-allocations--id-">
                                <a href="#tool-allocations-GETapi-tool-allocations--id-">Get a tool allocation</a>
                            </li>
                                                                                <li class="tocify-item level-2" data-unique="tool-allocations-DELETEapi-tool-allocations--id-">
                                <a href="#tool-allocations-DELETEapi-tool-allocations--id-">Delete a tool allocation</a>
                            </li>
                                                                                <li class="tocify-item level-2" data-unique="tool-allocations-PUTapi-tool-allocations--tool_allocation_id-">
                                <a href="#tool-allocations-PUTapi-tool-allocations--tool_allocation_id-">Update a tool allocation</a>
                            </li>
                                                                        </ul>
                            </ul>
                    <ul id="tocify-header-tool-categories" class="tocify-header">
                <li class="tocify-item level-1" data-unique="tool-categories">
                    <a href="#tool-categories">Tool Categories</a>
                </li>
                                    <ul id="tocify-subheader-tool-categories" class="tocify-subheader">
                                                    <li class="tocify-item level-2" data-unique="tool-categories-GETapi-tool-categories">
                                <a href="#tool-categories-GETapi-tool-categories">List all tool categories</a>
                            </li>
                                                                                <li class="tocify-item level-2" data-unique="tool-categories-POSTapi-tool-categories">
                                <a href="#tool-categories-POSTapi-tool-categories">Create a tool category</a>
                            </li>
                                                                                <li class="tocify-item level-2" data-unique="tool-categories-GETapi-tool-categories--id-">
                                <a href="#tool-categories-GETapi-tool-categories--id-">Get a tool category</a>
                            </li>
                                                                                <li class="tocify-item level-2" data-unique="tool-categories-PUTapi-tool-categories--id-">
                                <a href="#tool-categories-PUTapi-tool-categories--id-">Update a tool category</a>
                            </li>
                                                                                <li class="tocify-item level-2" data-unique="tool-categories-DELETEapi-tool-categories--id-">
                                <a href="#tool-categories-DELETEapi-tool-categories--id-">Delete a tool category</a>
                            </li>
                                                                        </ul>
                            </ul>
                    <ul id="tocify-header-tool-status-logs" class="tocify-header">
                <li class="tocify-item level-1" data-unique="tool-status-logs">
                    <a href="#tool-status-logs">Tool Status Logs</a>
                </li>
                                    <ul id="tocify-subheader-tool-status-logs" class="tocify-subheader">
                                                    <li class="tocify-item level-2" data-unique="tool-status-logs-GETapi-tool-status-logs">
                                <a href="#tool-status-logs-GETapi-tool-status-logs">List all tool status logs</a>
                            </li>
                                                                                <li class="tocify-item level-2" data-unique="tool-status-logs-POSTapi-tool-status-logs">
                                <a href="#tool-status-logs-POSTapi-tool-status-logs">Create a tool status log</a>
                            </li>
                                                                                <li class="tocify-item level-2" data-unique="tool-status-logs-GETapi-tool-status-logs--id-">
                                <a href="#tool-status-logs-GETapi-tool-status-logs--id-">Get a tool status log</a>
                            </li>
                                                                                <li class="tocify-item level-2" data-unique="tool-status-logs-PUTapi-tool-status-logs--id-">
                                <a href="#tool-status-logs-PUTapi-tool-status-logs--id-">Update a tool status log</a>
                            </li>
                                                                                <li class="tocify-item level-2" data-unique="tool-status-logs-DELETEapi-tool-status-logs--id-">
                                <a href="#tool-status-logs-DELETEapi-tool-status-logs--id-">Delete a tool status log</a>
                            </li>
                                                                        </ul>
                            </ul>
                    <ul id="tocify-header-tools" class="tocify-header">
                <li class="tocify-item level-1" data-unique="tools">
                    <a href="#tools">Tools</a>
                </li>
                                    <ul id="tocify-subheader-tools" class="tocify-subheader">
                                                    <li class="tocify-item level-2" data-unique="tools-GETapi-tools">
                                <a href="#tools-GETapi-tools">List all tools</a>
                            </li>
                                                                                <li class="tocify-item level-2" data-unique="tools-POSTapi-tools">
                                <a href="#tools-POSTapi-tools">Create a tool</a>
                            </li>
                                                                                <li class="tocify-item level-2" data-unique="tools-GETapi-tools--id-">
                                <a href="#tools-GETapi-tools--id-">Get a tool</a>
                            </li>
                                                                                <li class="tocify-item level-2" data-unique="tools-PUTapi-tools--id-">
                                <a href="#tools-PUTapi-tools--id-">Update a tool</a>
                            </li>
                                                                                <li class="tocify-item level-2" data-unique="tools-DELETEapi-tools--id-">
                                <a href="#tools-DELETEapi-tools--id-">Delete a tool</a>
                            </li>
                                                                        </ul>
                            </ul>
            </div>

    <ul class="toc-footer" id="toc-footer">
                    <li style="padding-bottom: 5px;"><a href="{{ route("scribe.postman") }}">View Postman collection</a></li>
                            <li style="padding-bottom: 5px;"><a href="{{ route("scribe.openapi") }}">View OpenAPI spec</a></li>
                <li><a href="http://github.com/knuckleswtf/scribe">Documentation powered by Scribe ✍</a></li>
    </ul>

    <ul class="toc-footer" id="last-updated">
        <li>Last updated: January 30, 2026</li>
    </ul>
</div>

<div class="page-wrapper">
    <div class="dark-box"></div>
    <div class="content">
        <h1 id="introduction">Introduction</h1>
<aside>
    <strong>Base URL</strong>: <code>http://toolsync.test</code>
</aside>
<pre><code>This documentation aims to provide all the information you need to work with our API.

&lt;aside&gt;As you scroll, you'll see code examples for working with the API in different programming languages in the dark area to the right (or as part of the content on mobile).
You can switch the language used with the tabs at the top right (or from the nav menu at the top left on mobile).&lt;/aside&gt;</code></pre>

        <h1 id="authenticating-requests">Authenticating requests</h1>
<p>This API is not authenticated.</p>

        <h1 id="analytics">Analytics</h1>

    <p>APIs for analytics and reporting data</p>

                                <h2 id="analytics-GETapi-analytics-overview">Get analytics overview</h2>

<p>
</p>

<p>Get comprehensive analytics including timeseries data, top tools, and status breakdown.</p>

<span id="example-requests-GETapi-analytics-overview">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request GET \
    --get "http://toolsync.test/api/analytics/overview?user_id=1&amp;from=2026-01-01&amp;to=2026-01-31" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json"</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/analytics/overview"
);

const params = {
    "user_id": "1",
    "from": "2026-01-01",
    "to": "2026-01-31",
};
Object.keys(params)
    .forEach(key =&gt; url.searchParams.append(key, params[key]));

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

fetch(url, {
    method: "GET",
    headers,
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-GETapi-analytics-overview">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;data&quot;: {
        &quot;scope&quot;: {
            &quot;user_id&quot;: null
        },
        &quot;range&quot;: {
            &quot;from&quot;: &quot;2026-01-01 00:00:00&quot;,
            &quot;to&quot;: &quot;2026-01-31 23:59:59&quot;
        },
        &quot;timeseries&quot;: {
            &quot;borrowed&quot;: [
                {
                    &quot;date&quot;: &quot;2026-01-15&quot;,
                    &quot;count&quot;: 5
                },
                {
                    &quot;date&quot;: &quot;2026-01-16&quot;,
                    &quot;count&quot;: 3
                }
            ],
            &quot;returned&quot;: [
                {
                    &quot;date&quot;: &quot;2026-01-20&quot;,
                    &quot;count&quot;: 4
                }
            ]
        },
        &quot;top_tools&quot;: [
            {
                &quot;tool_id&quot;: 1,
                &quot;tool_name&quot;: &quot;Laptop&quot;,
                &quot;borrow_count&quot;: 15
            },
            {
                &quot;tool_id&quot;: 2,
                &quot;tool_name&quot;: &quot;Projector&quot;,
                &quot;borrow_count&quot;: 10
            }
        ],
        &quot;status_breakdown&quot;: {
            &quot;borrowed&quot;: 10,
            &quot;returned&quot;: 25,
            &quot;overdue&quot;: 2
        }
    }
}</code>
 </pre>
    </span>
<span id="execution-results-GETapi-analytics-overview" hidden>
    <blockquote>Received response<span
                id="execution-response-status-GETapi-analytics-overview"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-GETapi-analytics-overview"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-GETapi-analytics-overview" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-GETapi-analytics-overview">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-GETapi-analytics-overview" data-method="GET"
      data-path="api/analytics/overview"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('GETapi-analytics-overview', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-GETapi-analytics-overview"
                    onclick="tryItOut('GETapi-analytics-overview');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-GETapi-analytics-overview"
                    onclick="cancelTryOut('GETapi-analytics-overview');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-GETapi-analytics-overview"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-green">GET</small>
            <b><code>api/analytics/overview</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="GETapi-analytics-overview"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="GETapi-analytics-overview"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                            <h4 class="fancy-heading-panel"><b>Query Parameters</b></h4>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>user_id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="user_id"                data-endpoint="GETapi-analytics-overview"
               value="1"
               data-component="query">
    <br>
<p>Filter data by user ID. Example: <code>1</code></p>
            </div>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>from</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="from"                data-endpoint="GETapi-analytics-overview"
               value="2026-01-01"
               data-component="query">
    <br>
<p>date Start date for the analytics period. Example: <code>2026-01-01</code></p>
            </div>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>to</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="to"                data-endpoint="GETapi-analytics-overview"
               value="2026-01-31"
               data-component="query">
    <br>
<p>date End date for the analytics period. Example: <code>2026-01-31</code></p>
            </div>
                </form>

                <h1 id="dashboard">Dashboard</h1>

    <p>APIs for dashboard statistics and overview data</p>

                                <h2 id="dashboard-GETapi-dashboard">Get dashboard overview</h2>

<p>
</p>

<p>Get dashboard statistics including tool counts, recent activity, and summary.</p>

<span id="example-requests-GETapi-dashboard">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request GET \
    --get "http://toolsync.test/api/dashboard?user_id=1&amp;recent_limit=5&amp;summary_days=30" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json"</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/dashboard"
);

const params = {
    "user_id": "1",
    "recent_limit": "5",
    "summary_days": "30",
};
Object.keys(params)
    .forEach(key =&gt; url.searchParams.append(key, params[key]));

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

fetch(url, {
    method: "GET",
    headers,
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-GETapi-dashboard">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;data&quot;: {
        &quot;scope&quot;: {
            &quot;user_id&quot;: null
        },
        &quot;counts&quot;: {
            &quot;tools_available_quantity&quot;: 25,
            &quot;tools_maintenance_quantity&quot;: 3,
            &quot;borrowed_active_count&quot;: 10,
            &quot;overdue_count&quot;: 2
        },
        &quot;recent_activity&quot;: [
            {
                &quot;id&quot;: 1,
                &quot;tool_id&quot;: 1,
                &quot;tool_name&quot;: &quot;Laptop&quot;,
                &quot;user_id&quot;: 1,
                &quot;user_name&quot;: &quot;John Doe&quot;,
                &quot;expected_return_date&quot;: &quot;2026-02-05&quot;,
                &quot;status&quot;: &quot;BORROWED&quot;,
                &quot;status_display&quot;: &quot;BORROWED&quot;,
                &quot;is_overdue&quot;: false
            }
        ],
        &quot;summary&quot;: {
            &quot;returned_count&quot;: 15,
            &quot;not_returned_count&quot;: 10,
            &quot;returned_percent&quot;: 60,
            &quot;not_returned_percent&quot;: 40,
            &quot;range_days&quot;: 30
        }
    }
}</code>
 </pre>
    </span>
<span id="execution-results-GETapi-dashboard" hidden>
    <blockquote>Received response<span
                id="execution-response-status-GETapi-dashboard"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-GETapi-dashboard"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-GETapi-dashboard" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-GETapi-dashboard">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-GETapi-dashboard" data-method="GET"
      data-path="api/dashboard"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('GETapi-dashboard', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-GETapi-dashboard"
                    onclick="tryItOut('GETapi-dashboard');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-GETapi-dashboard"
                    onclick="cancelTryOut('GETapi-dashboard');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-GETapi-dashboard"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-green">GET</small>
            <b><code>api/dashboard</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="GETapi-dashboard"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="GETapi-dashboard"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                            <h4 class="fancy-heading-panel"><b>Query Parameters</b></h4>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>user_id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="user_id"                data-endpoint="GETapi-dashboard"
               value="1"
               data-component="query">
    <br>
<p>Filter data by user ID. Example: <code>1</code></p>
            </div>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>recent_limit</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="recent_limit"                data-endpoint="GETapi-dashboard"
               value="5"
               data-component="query">
    <br>
<p>Number of recent allocations to return (1-50). Example: <code>5</code></p>
            </div>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>summary_days</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="summary_days"                data-endpoint="GETapi-dashboard"
               value="30"
               data-component="query">
    <br>
<p>Number of days for summary calculation (1-365). Example: <code>30</code></p>
            </div>
                </form>

                <h1 id="endpoints">Endpoints</h1>

    

                                <h2 id="endpoints-GETapi-user">GET api/user</h2>

<p>
</p>



<span id="example-requests-GETapi-user">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request GET \
    --get "http://toolsync.test/api/user" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json"</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/user"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

fetch(url, {
    method: "GET",
    headers,
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-GETapi-user">
            <blockquote>
            <p>Example response (401):</p>
        </blockquote>
                <details class="annotation">
            <summary style="cursor: pointer;">
                <small onclick="textContent = parentElement.parentElement.open ? 'Show headers' : 'Hide headers'">Show headers</small>
            </summary>
            <pre><code class="language-http">cache-control: no-cache, private
content-type: application/json
access-control-allow-origin: *
 </code></pre></details>         <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;message&quot;: &quot;Unauthenticated.&quot;
}</code>
 </pre>
    </span>
<span id="execution-results-GETapi-user" hidden>
    <blockquote>Received response<span
                id="execution-response-status-GETapi-user"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-GETapi-user"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-GETapi-user" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-GETapi-user">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-GETapi-user" data-method="GET"
      data-path="api/user"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('GETapi-user', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-GETapi-user"
                    onclick="tryItOut('GETapi-user');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-GETapi-user"
                    onclick="cancelTryOut('GETapi-user');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-GETapi-user"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-green">GET</small>
            <b><code>api/user</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="GETapi-user"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="GETapi-user"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                        </form>

                <h1 id="tool-allocation-history">Tool Allocation History</h1>

    <p>APIs for viewing tool allocation history with advanced filtering</p>

                                <h2 id="tool-allocation-history-GETapi-tool-allocations-history">List allocation history</h2>

<p>
</p>

<p>Get a paginated list of tool allocation history with advanced filters.</p>

<span id="example-requests-GETapi-tool-allocations-history">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request GET \
    --get "http://toolsync.test/api/tool-allocations/history?tool_id=1&amp;user_id=1&amp;status=BORROWED&amp;from=2026-01-01&amp;to=2026-01-31&amp;overdue=1&amp;per_page=20" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json"</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tool-allocations/history"
);

const params = {
    "tool_id": "1",
    "user_id": "1",
    "status": "BORROWED",
    "from": "2026-01-01",
    "to": "2026-01-31",
    "overdue": "1",
    "per_page": "20",
};
Object.keys(params)
    .forEach(key =&gt; url.searchParams.append(key, params[key]));

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

fetch(url, {
    method: "GET",
    headers,
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-GETapi-tool-allocations-history">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;current_page&quot;: 1,
    &quot;data&quot;: [
        {
            &quot;id&quot;: 1,
            &quot;tool_id&quot;: 1,
            &quot;user_id&quot;: 1,
            &quot;borrow_date&quot;: &quot;2026-01-29&quot;,
            &quot;expected_return_date&quot;: &quot;2026-02-05&quot;,
            &quot;actual_return_date&quot;: null,
            &quot;status&quot;: &quot;BORROWED&quot;,
            &quot;note&quot;: &quot;For project use&quot;,
            &quot;created_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
            &quot;updated_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
            &quot;is_overdue&quot;: true,
            &quot;status_display&quot;: &quot;OVERDUE&quot;,
            &quot;tool&quot;: {
                &quot;id&quot;: 1,
                &quot;name&quot;: &quot;Laptop&quot;
            },
            &quot;user&quot;: {
                &quot;id&quot;: 1,
                &quot;name&quot;: &quot;John Doe&quot;
            }
        }
    ],
    &quot;per_page&quot;: 20,
    &quot;total&quot;: 1
}</code>
 </pre>
    </span>
<span id="execution-results-GETapi-tool-allocations-history" hidden>
    <blockquote>Received response<span
                id="execution-response-status-GETapi-tool-allocations-history"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-GETapi-tool-allocations-history"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-GETapi-tool-allocations-history" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-GETapi-tool-allocations-history">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-GETapi-tool-allocations-history" data-method="GET"
      data-path="api/tool-allocations/history"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('GETapi-tool-allocations-history', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-GETapi-tool-allocations-history"
                    onclick="tryItOut('GETapi-tool-allocations-history');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-GETapi-tool-allocations-history"
                    onclick="cancelTryOut('GETapi-tool-allocations-history');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-GETapi-tool-allocations-history"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-green">GET</small>
            <b><code>api/tool-allocations/history</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="GETapi-tool-allocations-history"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="GETapi-tool-allocations-history"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                            <h4 class="fancy-heading-panel"><b>Query Parameters</b></h4>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>tool_id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool_id"                data-endpoint="GETapi-tool-allocations-history"
               value="1"
               data-component="query">
    <br>
<p>Filter by tool ID. Example: <code>1</code></p>
            </div>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>user_id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="user_id"                data-endpoint="GETapi-tool-allocations-history"
               value="1"
               data-component="query">
    <br>
<p>Filter by user ID. Example: <code>1</code></p>
            </div>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>status</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="status"                data-endpoint="GETapi-tool-allocations-history"
               value="BORROWED"
               data-component="query">
    <br>
<p>Filter by status. Example: <code>BORROWED</code></p>
            </div>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>from</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="from"                data-endpoint="GETapi-tool-allocations-history"
               value="2026-01-01"
               data-component="query">
    <br>
<p>date Filter allocations from this date. Example: <code>2026-01-01</code></p>
            </div>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>to</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="to"                data-endpoint="GETapi-tool-allocations-history"
               value="2026-01-31"
               data-component="query">
    <br>
<p>date Filter allocations until this date. Example: <code>2026-01-31</code></p>
            </div>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>overdue</code></b>&nbsp;&nbsp;
<small>boolean</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <label data-endpoint="GETapi-tool-allocations-history" style="display: none">
            <input type="radio" name="overdue"
                   value="1"
                   data-endpoint="GETapi-tool-allocations-history"
                   data-component="query"             >
            <code>true</code>
        </label>
        <label data-endpoint="GETapi-tool-allocations-history" style="display: none">
            <input type="radio" name="overdue"
                   value="0"
                   data-endpoint="GETapi-tool-allocations-history"
                   data-component="query"             >
            <code>false</code>
        </label>
    <br>
<p>Filter only overdue allocations. Example: <code>true</code></p>
            </div>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>per_page</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="per_page"                data-endpoint="GETapi-tool-allocations-history"
               value="20"
               data-component="query">
    <br>
<p>Number of results per page (1-100). Example: <code>20</code></p>
            </div>
                </form>

                <h1 id="tool-allocations">Tool Allocations</h1>

    <p>APIs for managing tool allocations (borrow/return operations)</p>

                                <h2 id="tool-allocations-GETapi-tool-allocations">List all tool allocations</h2>

<p>
</p>

<p>Get a list of all tool allocations with optional filters.</p>

<span id="example-requests-GETapi-tool-allocations">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request GET \
    --get "http://toolsync.test/api/tool-allocations?tool_id=1&amp;user_id=1&amp;status=BORROWED" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json"</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tool-allocations"
);

const params = {
    "tool_id": "1",
    "user_id": "1",
    "status": "BORROWED",
};
Object.keys(params)
    .forEach(key =&gt; url.searchParams.append(key, params[key]));

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

fetch(url, {
    method: "GET",
    headers,
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-GETapi-tool-allocations">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;data&quot;: [
        {
            &quot;id&quot;: 1,
            &quot;tool_id&quot;: 1,
            &quot;user_id&quot;: 1,
            &quot;borrow_date&quot;: &quot;2026-01-29&quot;,
            &quot;expected_return_date&quot;: &quot;2026-02-05&quot;,
            &quot;actual_return_date&quot;: null,
            &quot;status&quot;: &quot;BORROWED&quot;,
            &quot;note&quot;: &quot;For project use&quot;,
            &quot;created_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
            &quot;updated_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
            &quot;tool&quot;: {
                &quot;id&quot;: 1,
                &quot;name&quot;: &quot;Laptop&quot;
            },
            &quot;user&quot;: {
                &quot;id&quot;: 1,
                &quot;name&quot;: &quot;John Doe&quot;
            }
        }
    ]
}</code>
 </pre>
    </span>
<span id="execution-results-GETapi-tool-allocations" hidden>
    <blockquote>Received response<span
                id="execution-response-status-GETapi-tool-allocations"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-GETapi-tool-allocations"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-GETapi-tool-allocations" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-GETapi-tool-allocations">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-GETapi-tool-allocations" data-method="GET"
      data-path="api/tool-allocations"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('GETapi-tool-allocations', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-GETapi-tool-allocations"
                    onclick="tryItOut('GETapi-tool-allocations');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-GETapi-tool-allocations"
                    onclick="cancelTryOut('GETapi-tool-allocations');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-GETapi-tool-allocations"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-green">GET</small>
            <b><code>api/tool-allocations</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="GETapi-tool-allocations"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="GETapi-tool-allocations"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                            <h4 class="fancy-heading-panel"><b>Query Parameters</b></h4>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>tool_id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool_id"                data-endpoint="GETapi-tool-allocations"
               value="1"
               data-component="query">
    <br>
<p>Filter by tool ID. Example: <code>1</code></p>
            </div>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>user_id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="user_id"                data-endpoint="GETapi-tool-allocations"
               value="1"
               data-component="query">
    <br>
<p>Filter by user ID. Example: <code>1</code></p>
            </div>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>status</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="status"                data-endpoint="GETapi-tool-allocations"
               value="BORROWED"
               data-component="query">
    <br>
<p>Filter by status. Example: <code>BORROWED</code></p>
            </div>
                </form>

                    <h2 id="tool-allocations-POSTapi-tool-allocations">Create a tool allocation</h2>

<p>
</p>

<p>Record a new tool borrow operation.</p>

<span id="example-requests-POSTapi-tool-allocations">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request POST \
    "http://toolsync.test/api/tool-allocations" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --data "{
    \"tool_id\": 1,
    \"user_id\": 1,
    \"borrow_date\": \"2026-01-29\",
    \"expected_return_date\": \"2026-02-05\",
    \"note\": \"For project use\"
}"
</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tool-allocations"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

let body = {
    "tool_id": 1,
    "user_id": 1,
    "borrow_date": "2026-01-29",
    "expected_return_date": "2026-02-05",
    "note": "For project use"
};

fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-POSTapi-tool-allocations">
            <blockquote>
            <p>Example response (201):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;message&quot;: &quot;Tool allocation created successfully.&quot;,
    &quot;data&quot;: {
        &quot;id&quot;: 1,
        &quot;tool_id&quot;: 1,
        &quot;user_id&quot;: 1,
        &quot;borrow_date&quot;: &quot;2026-01-29&quot;,
        &quot;expected_return_date&quot;: &quot;2026-02-05&quot;,
        &quot;actual_return_date&quot;: null,
        &quot;status&quot;: &quot;BORROWED&quot;,
        &quot;note&quot;: &quot;For project use&quot;,
        &quot;created_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
        &quot;updated_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
        &quot;tool&quot;: {
            &quot;id&quot;: 1,
            &quot;name&quot;: &quot;Laptop&quot;
        },
        &quot;user&quot;: {
            &quot;id&quot;: 1,
            &quot;name&quot;: &quot;John Doe&quot;
        }
    }
}</code>
 </pre>
            <blockquote>
            <p>Example response (409):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;message&quot;: &quot;Tool is not available for borrowing.&quot;
}</code>
 </pre>
    </span>
<span id="execution-results-POSTapi-tool-allocations" hidden>
    <blockquote>Received response<span
                id="execution-response-status-POSTapi-tool-allocations"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-POSTapi-tool-allocations"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-POSTapi-tool-allocations" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-POSTapi-tool-allocations">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-POSTapi-tool-allocations" data-method="POST"
      data-path="api/tool-allocations"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('POSTapi-tool-allocations', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-POSTapi-tool-allocations"
                    onclick="tryItOut('POSTapi-tool-allocations');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-POSTapi-tool-allocations"
                    onclick="cancelTryOut('POSTapi-tool-allocations');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-POSTapi-tool-allocations"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-black">POST</small>
            <b><code>api/tool-allocations</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="POSTapi-tool-allocations"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="POSTapi-tool-allocations"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <h4 class="fancy-heading-panel"><b>Body Parameters</b></h4>
        <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>tool_id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool_id"                data-endpoint="POSTapi-tool-allocations"
               value="1"
               data-component="body">
    <br>
<p>The ID of the tool to borrow. Example: <code>1</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>user_id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="user_id"                data-endpoint="POSTapi-tool-allocations"
               value="1"
               data-component="body">
    <br>
<p>The ID of the user borrowing the tool. Example: <code>1</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>borrow_date</code></b>&nbsp;&nbsp;
<small>date</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="borrow_date"                data-endpoint="POSTapi-tool-allocations"
               value="2026-01-29"
               data-component="body">
    <br>
<p>The date of borrowing. Example: <code>2026-01-29</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>expected_return_date</code></b>&nbsp;&nbsp;
<small>date</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="expected_return_date"                data-endpoint="POSTapi-tool-allocations"
               value="2026-02-05"
               data-component="body">
    <br>
<p>The expected return date. Example: <code>2026-02-05</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>note</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="note"                data-endpoint="POSTapi-tool-allocations"
               value="For project use"
               data-component="body">
    <br>
<p>Optional note for the allocation. Example: <code>For project use</code></p>
        </div>
        </form>

                    <h2 id="tool-allocations-GETapi-tool-allocations--id-">Get a tool allocation</h2>

<p>
</p>

<p>Get details of a specific tool allocation.</p>

<span id="example-requests-GETapi-tool-allocations--id-">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request GET \
    --get "http://toolsync.test/api/tool-allocations/16" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json"</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tool-allocations/16"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

fetch(url, {
    method: "GET",
    headers,
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-GETapi-tool-allocations--id-">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;data&quot;: {
        &quot;id&quot;: 1,
        &quot;tool_id&quot;: 1,
        &quot;user_id&quot;: 1,
        &quot;borrow_date&quot;: &quot;2026-01-29&quot;,
        &quot;expected_return_date&quot;: &quot;2026-02-05&quot;,
        &quot;actual_return_date&quot;: null,
        &quot;status&quot;: &quot;BORROWED&quot;,
        &quot;note&quot;: &quot;For project use&quot;,
        &quot;created_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
        &quot;updated_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
        &quot;tool&quot;: {
            &quot;id&quot;: 1,
            &quot;name&quot;: &quot;Laptop&quot;
        },
        &quot;user&quot;: {
            &quot;id&quot;: 1,
            &quot;name&quot;: &quot;John Doe&quot;
        }
    }
}</code>
 </pre>
    </span>
<span id="execution-results-GETapi-tool-allocations--id-" hidden>
    <blockquote>Received response<span
                id="execution-response-status-GETapi-tool-allocations--id-"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-GETapi-tool-allocations--id-"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-GETapi-tool-allocations--id-" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-GETapi-tool-allocations--id-">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-GETapi-tool-allocations--id-" data-method="GET"
      data-path="api/tool-allocations/{id}"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('GETapi-tool-allocations--id-', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-GETapi-tool-allocations--id-"
                    onclick="tryItOut('GETapi-tool-allocations--id-');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-GETapi-tool-allocations--id-"
                    onclick="cancelTryOut('GETapi-tool-allocations--id-');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-GETapi-tool-allocations--id-"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-green">GET</small>
            <b><code>api/tool-allocations/{id}</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="GETapi-tool-allocations--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="GETapi-tool-allocations--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                        <h4 class="fancy-heading-panel"><b>URL Parameters</b></h4>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="id"                data-endpoint="GETapi-tool-allocations--id-"
               value="16"
               data-component="url">
    <br>
<p>The ID of the tool allocation. Example: <code>16</code></p>
            </div>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>tool_allocation</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool_allocation"                data-endpoint="GETapi-tool-allocations--id-"
               value="1"
               data-component="url">
    <br>
<p>The ID of the allocation. Example: <code>1</code></p>
            </div>
                    </form>

                    <h2 id="tool-allocations-DELETEapi-tool-allocations--id-">Delete a tool allocation</h2>

<p>
</p>

<p>Delete a tool allocation record.</p>

<span id="example-requests-DELETEapi-tool-allocations--id-">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request DELETE \
    "http://toolsync.test/api/tool-allocations/16" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json"</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tool-allocations/16"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

fetch(url, {
    method: "DELETE",
    headers,
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-DELETEapi-tool-allocations--id-">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;message&quot;: &quot;Tool allocation deleted successfully.&quot;
}</code>
 </pre>
    </span>
<span id="execution-results-DELETEapi-tool-allocations--id-" hidden>
    <blockquote>Received response<span
                id="execution-response-status-DELETEapi-tool-allocations--id-"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-DELETEapi-tool-allocations--id-"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-DELETEapi-tool-allocations--id-" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-DELETEapi-tool-allocations--id-">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-DELETEapi-tool-allocations--id-" data-method="DELETE"
      data-path="api/tool-allocations/{id}"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('DELETEapi-tool-allocations--id-', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-DELETEapi-tool-allocations--id-"
                    onclick="tryItOut('DELETEapi-tool-allocations--id-');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-DELETEapi-tool-allocations--id-"
                    onclick="cancelTryOut('DELETEapi-tool-allocations--id-');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-DELETEapi-tool-allocations--id-"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-red">DELETE</small>
            <b><code>api/tool-allocations/{id}</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="DELETEapi-tool-allocations--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="DELETEapi-tool-allocations--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                        <h4 class="fancy-heading-panel"><b>URL Parameters</b></h4>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="id"                data-endpoint="DELETEapi-tool-allocations--id-"
               value="16"
               data-component="url">
    <br>
<p>The ID of the tool allocation. Example: <code>16</code></p>
            </div>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>tool_allocation</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool_allocation"                data-endpoint="DELETEapi-tool-allocations--id-"
               value="1"
               data-component="url">
    <br>
<p>The ID of the allocation. Example: <code>1</code></p>
            </div>
                    </form>

                    <h2 id="tool-allocations-PUTapi-tool-allocations--tool_allocation_id-">Update a tool allocation</h2>

<p>
</p>

<p>Update an existing tool allocation (e.g., mark as returned).</p>

<span id="example-requests-PUTapi-tool-allocations--tool_allocation_id-">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request PUT \
    "http://toolsync.test/api/tool-allocations/16" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --data "{
    \"tool_id\": 1,
    \"user_id\": 1,
    \"borrow_date\": \"2026-01-29\",
    \"expected_return_date\": \"2026-02-05\",
    \"actual_return_date\": \"2026-02-04\",
    \"note\": \"Returned in good condition\",
    \"status\": \"RETURNED\"
}"
</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tool-allocations/16"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

let body = {
    "tool_id": 1,
    "user_id": 1,
    "borrow_date": "2026-01-29",
    "expected_return_date": "2026-02-05",
    "actual_return_date": "2026-02-04",
    "note": "Returned in good condition",
    "status": "RETURNED"
};

fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-PUTapi-tool-allocations--tool_allocation_id-">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;message&quot;: &quot;Tool allocation updated successfully.&quot;,
    &quot;data&quot;: {
        &quot;id&quot;: 1,
        &quot;tool_id&quot;: 1,
        &quot;user_id&quot;: 1,
        &quot;borrow_date&quot;: &quot;2026-01-29&quot;,
        &quot;expected_return_date&quot;: &quot;2026-02-05&quot;,
        &quot;actual_return_date&quot;: &quot;2026-02-04&quot;,
        &quot;status&quot;: &quot;RETURNED&quot;,
        &quot;note&quot;: &quot;Returned in good condition&quot;,
        &quot;created_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
        &quot;updated_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
        &quot;tool&quot;: {
            &quot;id&quot;: 1,
            &quot;name&quot;: &quot;Laptop&quot;
        },
        &quot;user&quot;: {
            &quot;id&quot;: 1,
            &quot;name&quot;: &quot;John Doe&quot;
        }
    }
}</code>
 </pre>
            <blockquote>
            <p>Example response (403):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;message&quot;: &quot;Only admins can update tool allocations.&quot;
}</code>
 </pre>
    </span>
<span id="execution-results-PUTapi-tool-allocations--tool_allocation_id-" hidden>
    <blockquote>Received response<span
                id="execution-response-status-PUTapi-tool-allocations--tool_allocation_id-"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-PUTapi-tool-allocations--tool_allocation_id-"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-PUTapi-tool-allocations--tool_allocation_id-" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-PUTapi-tool-allocations--tool_allocation_id-">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-PUTapi-tool-allocations--tool_allocation_id-" data-method="PUT"
      data-path="api/tool-allocations/{tool_allocation_id}"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('PUTapi-tool-allocations--tool_allocation_id-', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-PUTapi-tool-allocations--tool_allocation_id-"
                    onclick="tryItOut('PUTapi-tool-allocations--tool_allocation_id-');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-PUTapi-tool-allocations--tool_allocation_id-"
                    onclick="cancelTryOut('PUTapi-tool-allocations--tool_allocation_id-');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-PUTapi-tool-allocations--tool_allocation_id-"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-darkblue">PUT</small>
            <b><code>api/tool-allocations/{tool_allocation_id}</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="PUTapi-tool-allocations--tool_allocation_id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="PUTapi-tool-allocations--tool_allocation_id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                        <h4 class="fancy-heading-panel"><b>URL Parameters</b></h4>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>tool_allocation_id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool_allocation_id"                data-endpoint="PUTapi-tool-allocations--tool_allocation_id-"
               value="16"
               data-component="url">
    <br>
<p>The ID of the tool allocation. Example: <code>16</code></p>
            </div>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>tool_allocation</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool_allocation"                data-endpoint="PUTapi-tool-allocations--tool_allocation_id-"
               value="1"
               data-component="url">
    <br>
<p>The ID of the allocation. Example: <code>1</code></p>
            </div>
                            <h4 class="fancy-heading-panel"><b>Body Parameters</b></h4>
        <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>tool_id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool_id"                data-endpoint="PUTapi-tool-allocations--tool_allocation_id-"
               value="1"
               data-component="body">
    <br>
<p>The ID of the tool. Example: <code>1</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>user_id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="user_id"                data-endpoint="PUTapi-tool-allocations--tool_allocation_id-"
               value="1"
               data-component="body">
    <br>
<p>The ID of the user. Example: <code>1</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>borrow_date</code></b>&nbsp;&nbsp;
<small>date</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="borrow_date"                data-endpoint="PUTapi-tool-allocations--tool_allocation_id-"
               value="2026-01-29"
               data-component="body">
    <br>
<p>The date of borrowing. Example: <code>2026-01-29</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>expected_return_date</code></b>&nbsp;&nbsp;
<small>date</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="expected_return_date"                data-endpoint="PUTapi-tool-allocations--tool_allocation_id-"
               value="2026-02-05"
               data-component="body">
    <br>
<p>The expected return date. Example: <code>2026-02-05</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>actual_return_date</code></b>&nbsp;&nbsp;
<small>date</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="actual_return_date"                data-endpoint="PUTapi-tool-allocations--tool_allocation_id-"
               value="2026-02-04"
               data-component="body">
    <br>
<p>The actual return date. Example: <code>2026-02-04</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>note</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="note"                data-endpoint="PUTapi-tool-allocations--tool_allocation_id-"
               value="Returned in good condition"
               data-component="body">
    <br>
<p>Optional note. Example: <code>Returned in good condition</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>status</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="status"                data-endpoint="PUTapi-tool-allocations--tool_allocation_id-"
               value="RETURNED"
               data-component="body">
    <br>
<p>The status of the allocation. Example: <code>RETURNED</code></p>
        </div>
        </form>

                <h1 id="tool-categories">Tool Categories</h1>

    <p>APIs for managing tool categories</p>

                                <h2 id="tool-categories-GETapi-tool-categories">List all tool categories</h2>

<p>
</p>

<p>Get a list of all tool categories with their tool count.</p>

<span id="example-requests-GETapi-tool-categories">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request GET \
    --get "http://toolsync.test/api/tool-categories" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json"</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tool-categories"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

fetch(url, {
    method: "GET",
    headers,
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-GETapi-tool-categories">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;data&quot;: [
        {
            &quot;id&quot;: 1,
            &quot;name&quot;: &quot;IT Equipment&quot;,
            &quot;created_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
            &quot;updated_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
            &quot;tools_count&quot;: 5
        }
    ]
}</code>
 </pre>
    </span>
<span id="execution-results-GETapi-tool-categories" hidden>
    <blockquote>Received response<span
                id="execution-response-status-GETapi-tool-categories"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-GETapi-tool-categories"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-GETapi-tool-categories" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-GETapi-tool-categories">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-GETapi-tool-categories" data-method="GET"
      data-path="api/tool-categories"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('GETapi-tool-categories', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-GETapi-tool-categories"
                    onclick="tryItOut('GETapi-tool-categories');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-GETapi-tool-categories"
                    onclick="cancelTryOut('GETapi-tool-categories');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-GETapi-tool-categories"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-green">GET</small>
            <b><code>api/tool-categories</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="GETapi-tool-categories"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="GETapi-tool-categories"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                        </form>

                    <h2 id="tool-categories-POSTapi-tool-categories">Create a tool category</h2>

<p>
</p>

<p>Create a new tool category.</p>

<span id="example-requests-POSTapi-tool-categories">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request POST \
    "http://toolsync.test/api/tool-categories" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --data "{
    \"name\": \"IT Equipment\"
}"
</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tool-categories"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

let body = {
    "name": "IT Equipment"
};

fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-POSTapi-tool-categories">
            <blockquote>
            <p>Example response (201):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;message&quot;: &quot;Tool category created successfully.&quot;,
    &quot;data&quot;: {
        &quot;id&quot;: 1,
        &quot;name&quot;: &quot;IT Equipment&quot;,
        &quot;created_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
        &quot;updated_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;
    }
}</code>
 </pre>
    </span>
<span id="execution-results-POSTapi-tool-categories" hidden>
    <blockquote>Received response<span
                id="execution-response-status-POSTapi-tool-categories"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-POSTapi-tool-categories"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-POSTapi-tool-categories" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-POSTapi-tool-categories">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-POSTapi-tool-categories" data-method="POST"
      data-path="api/tool-categories"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('POSTapi-tool-categories', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-POSTapi-tool-categories"
                    onclick="tryItOut('POSTapi-tool-categories');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-POSTapi-tool-categories"
                    onclick="cancelTryOut('POSTapi-tool-categories');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-POSTapi-tool-categories"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-black">POST</small>
            <b><code>api/tool-categories</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="POSTapi-tool-categories"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="POSTapi-tool-categories"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <h4 class="fancy-heading-panel"><b>Body Parameters</b></h4>
        <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>name</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="name"                data-endpoint="POSTapi-tool-categories"
               value="IT Equipment"
               data-component="body">
    <br>
<p>The name of the category. Example: <code>IT Equipment</code></p>
        </div>
        </form>

                    <h2 id="tool-categories-GETapi-tool-categories--id-">Get a tool category</h2>

<p>
</p>

<p>Get details of a specific tool category.</p>

<span id="example-requests-GETapi-tool-categories--id-">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request GET \
    --get "http://toolsync.test/api/tool-categories/1" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json"</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tool-categories/1"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

fetch(url, {
    method: "GET",
    headers,
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-GETapi-tool-categories--id-">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;data&quot;: {
        &quot;id&quot;: 1,
        &quot;name&quot;: &quot;IT Equipment&quot;,
        &quot;created_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
        &quot;updated_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
        &quot;tools_count&quot;: 5
    }
}</code>
 </pre>
    </span>
<span id="execution-results-GETapi-tool-categories--id-" hidden>
    <blockquote>Received response<span
                id="execution-response-status-GETapi-tool-categories--id-"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-GETapi-tool-categories--id-"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-GETapi-tool-categories--id-" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-GETapi-tool-categories--id-">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-GETapi-tool-categories--id-" data-method="GET"
      data-path="api/tool-categories/{id}"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('GETapi-tool-categories--id-', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-GETapi-tool-categories--id-"
                    onclick="tryItOut('GETapi-tool-categories--id-');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-GETapi-tool-categories--id-"
                    onclick="cancelTryOut('GETapi-tool-categories--id-');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-GETapi-tool-categories--id-"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-green">GET</small>
            <b><code>api/tool-categories/{id}</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="GETapi-tool-categories--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="GETapi-tool-categories--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                        <h4 class="fancy-heading-panel"><b>URL Parameters</b></h4>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="id"                data-endpoint="GETapi-tool-categories--id-"
               value="1"
               data-component="url">
    <br>
<p>The ID of the tool category. Example: <code>1</code></p>
            </div>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>tool_category</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool_category"                data-endpoint="GETapi-tool-categories--id-"
               value="1"
               data-component="url">
    <br>
<p>The ID of the category. Example: <code>1</code></p>
            </div>
                    </form>

                    <h2 id="tool-categories-PUTapi-tool-categories--id-">Update a tool category</h2>

<p>
</p>

<p>Update an existing tool category.</p>

<span id="example-requests-PUTapi-tool-categories--id-">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request PUT \
    "http://toolsync.test/api/tool-categories/1" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --data "{
    \"name\": \"Office Equipment\"
}"
</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tool-categories/1"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

let body = {
    "name": "Office Equipment"
};

fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-PUTapi-tool-categories--id-">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;message&quot;: &quot;Tool category updated successfully.&quot;,
    &quot;data&quot;: {
        &quot;id&quot;: 1,
        &quot;name&quot;: &quot;Office Equipment&quot;,
        &quot;created_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
        &quot;updated_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;
    }
}</code>
 </pre>
    </span>
<span id="execution-results-PUTapi-tool-categories--id-" hidden>
    <blockquote>Received response<span
                id="execution-response-status-PUTapi-tool-categories--id-"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-PUTapi-tool-categories--id-"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-PUTapi-tool-categories--id-" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-PUTapi-tool-categories--id-">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-PUTapi-tool-categories--id-" data-method="PUT"
      data-path="api/tool-categories/{id}"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('PUTapi-tool-categories--id-', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-PUTapi-tool-categories--id-"
                    onclick="tryItOut('PUTapi-tool-categories--id-');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-PUTapi-tool-categories--id-"
                    onclick="cancelTryOut('PUTapi-tool-categories--id-');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-PUTapi-tool-categories--id-"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-darkblue">PUT</small>
            <b><code>api/tool-categories/{id}</code></b>
        </p>
            <p>
            <small class="badge badge-purple">PATCH</small>
            <b><code>api/tool-categories/{id}</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="PUTapi-tool-categories--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="PUTapi-tool-categories--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                        <h4 class="fancy-heading-panel"><b>URL Parameters</b></h4>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="id"                data-endpoint="PUTapi-tool-categories--id-"
               value="1"
               data-component="url">
    <br>
<p>The ID of the tool category. Example: <code>1</code></p>
            </div>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>tool_category</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool_category"                data-endpoint="PUTapi-tool-categories--id-"
               value="1"
               data-component="url">
    <br>
<p>The ID of the category. Example: <code>1</code></p>
            </div>
                            <h4 class="fancy-heading-panel"><b>Body Parameters</b></h4>
        <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>name</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="name"                data-endpoint="PUTapi-tool-categories--id-"
               value="Office Equipment"
               data-component="body">
    <br>
<p>The name of the category. Example: <code>Office Equipment</code></p>
        </div>
        </form>

                    <h2 id="tool-categories-DELETEapi-tool-categories--id-">Delete a tool category</h2>

<p>
</p>

<p>Delete a tool category. Cannot delete if category has tools.</p>

<span id="example-requests-DELETEapi-tool-categories--id-">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request DELETE \
    "http://toolsync.test/api/tool-categories/1" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json"</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tool-categories/1"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

fetch(url, {
    method: "DELETE",
    headers,
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-DELETEapi-tool-categories--id-">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;message&quot;: &quot;Tool category deleted successfully.&quot;
}</code>
 </pre>
            <blockquote>
            <p>Example response (422):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;message&quot;: &quot;Cannot delete category with existing tools.&quot;
}</code>
 </pre>
    </span>
<span id="execution-results-DELETEapi-tool-categories--id-" hidden>
    <blockquote>Received response<span
                id="execution-response-status-DELETEapi-tool-categories--id-"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-DELETEapi-tool-categories--id-"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-DELETEapi-tool-categories--id-" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-DELETEapi-tool-categories--id-">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-DELETEapi-tool-categories--id-" data-method="DELETE"
      data-path="api/tool-categories/{id}"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('DELETEapi-tool-categories--id-', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-DELETEapi-tool-categories--id-"
                    onclick="tryItOut('DELETEapi-tool-categories--id-');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-DELETEapi-tool-categories--id-"
                    onclick="cancelTryOut('DELETEapi-tool-categories--id-');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-DELETEapi-tool-categories--id-"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-red">DELETE</small>
            <b><code>api/tool-categories/{id}</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="DELETEapi-tool-categories--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="DELETEapi-tool-categories--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                        <h4 class="fancy-heading-panel"><b>URL Parameters</b></h4>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="id"                data-endpoint="DELETEapi-tool-categories--id-"
               value="1"
               data-component="url">
    <br>
<p>The ID of the tool category. Example: <code>1</code></p>
            </div>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>tool_category</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool_category"                data-endpoint="DELETEapi-tool-categories--id-"
               value="1"
               data-component="url">
    <br>
<p>The ID of the category. Example: <code>1</code></p>
            </div>
                    </form>

                <h1 id="tool-status-logs">Tool Status Logs</h1>

    <p>APIs for managing tool status change history</p>

                                <h2 id="tool-status-logs-GETapi-tool-status-logs">List all tool status logs</h2>

<p>
</p>

<p>Get a paginated list of tool status change logs with optional filters.</p>

<span id="example-requests-GETapi-tool-status-logs">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request GET \
    --get "http://toolsync.test/api/tool-status-logs?tool_id=1&amp;changed_by=1&amp;new_status=MAINTENANCE&amp;per_page=20" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json"</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tool-status-logs"
);

const params = {
    "tool_id": "1",
    "changed_by": "1",
    "new_status": "MAINTENANCE",
    "per_page": "20",
};
Object.keys(params)
    .forEach(key =&gt; url.searchParams.append(key, params[key]));

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

fetch(url, {
    method: "GET",
    headers,
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-GETapi-tool-status-logs">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;current_page&quot;: 1,
    &quot;data&quot;: [
        {
            &quot;id&quot;: 1,
            &quot;tool_id&quot;: 1,
            &quot;old_status&quot;: &quot;AVAILABLE&quot;,
            &quot;new_status&quot;: &quot;MAINTENANCE&quot;,
            &quot;changed_by&quot;: 1,
            &quot;changed_at&quot;: &quot;2026-01-29T10:00:00.000000Z&quot;,
            &quot;created_at&quot;: &quot;2026-01-29T10:00:00.000000Z&quot;,
            &quot;updated_at&quot;: &quot;2026-01-29T10:00:00.000000Z&quot;,
            &quot;tool&quot;: {
                &quot;id&quot;: 1,
                &quot;name&quot;: &quot;Laptop&quot;
            },
            &quot;changed_by_user&quot;: {
                &quot;id&quot;: 1,
                &quot;name&quot;: &quot;Admin User&quot;
            }
        }
    ],
    &quot;per_page&quot;: 20,
    &quot;total&quot;: 1
}</code>
 </pre>
    </span>
<span id="execution-results-GETapi-tool-status-logs" hidden>
    <blockquote>Received response<span
                id="execution-response-status-GETapi-tool-status-logs"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-GETapi-tool-status-logs"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-GETapi-tool-status-logs" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-GETapi-tool-status-logs">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-GETapi-tool-status-logs" data-method="GET"
      data-path="api/tool-status-logs"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('GETapi-tool-status-logs', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-GETapi-tool-status-logs"
                    onclick="tryItOut('GETapi-tool-status-logs');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-GETapi-tool-status-logs"
                    onclick="cancelTryOut('GETapi-tool-status-logs');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-GETapi-tool-status-logs"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-green">GET</small>
            <b><code>api/tool-status-logs</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="GETapi-tool-status-logs"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="GETapi-tool-status-logs"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                            <h4 class="fancy-heading-panel"><b>Query Parameters</b></h4>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>tool_id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool_id"                data-endpoint="GETapi-tool-status-logs"
               value="1"
               data-component="query">
    <br>
<p>Filter by tool ID. Example: <code>1</code></p>
            </div>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>changed_by</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="changed_by"                data-endpoint="GETapi-tool-status-logs"
               value="1"
               data-component="query">
    <br>
<p>Filter by user who made the change. Example: <code>1</code></p>
            </div>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>new_status</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="new_status"                data-endpoint="GETapi-tool-status-logs"
               value="MAINTENANCE"
               data-component="query">
    <br>
<p>Filter by new status. Example: <code>MAINTENANCE</code></p>
            </div>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>per_page</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="per_page"                data-endpoint="GETapi-tool-status-logs"
               value="20"
               data-component="query">
    <br>
<p>Number of results per page (1-100). Example: <code>20</code></p>
            </div>
                </form>

                    <h2 id="tool-status-logs-POSTapi-tool-status-logs">Create a tool status log</h2>

<p>
</p>

<p>Manually create a tool status change log entry.</p>

<span id="example-requests-POSTapi-tool-status-logs">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request POST \
    "http://toolsync.test/api/tool-status-logs" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --data "{
    \"tool_id\": 1,
    \"old_status\": \"AVAILABLE\",
    \"new_status\": \"MAINTENANCE\",
    \"changed_by\": 1,
    \"changed_at\": \"2026-01-29T10:00:00Z\"
}"
</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tool-status-logs"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

let body = {
    "tool_id": 1,
    "old_status": "AVAILABLE",
    "new_status": "MAINTENANCE",
    "changed_by": 1,
    "changed_at": "2026-01-29T10:00:00Z"
};

fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-POSTapi-tool-status-logs">
            <blockquote>
            <p>Example response (201):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;message&quot;: &quot;Tool status log created successfully.&quot;,
    &quot;data&quot;: {
        &quot;id&quot;: 1,
        &quot;tool_id&quot;: 1,
        &quot;old_status&quot;: &quot;AVAILABLE&quot;,
        &quot;new_status&quot;: &quot;MAINTENANCE&quot;,
        &quot;changed_by&quot;: 1,
        &quot;changed_at&quot;: &quot;2026-01-29T10:00:00.000000Z&quot;,
        &quot;created_at&quot;: &quot;2026-01-29T10:00:00.000000Z&quot;,
        &quot;updated_at&quot;: &quot;2026-01-29T10:00:00.000000Z&quot;,
        &quot;tool&quot;: {
            &quot;id&quot;: 1,
            &quot;name&quot;: &quot;Laptop&quot;
        },
        &quot;changed_by_user&quot;: {
            &quot;id&quot;: 1,
            &quot;name&quot;: &quot;Admin User&quot;
        }
    }
}</code>
 </pre>
    </span>
<span id="execution-results-POSTapi-tool-status-logs" hidden>
    <blockquote>Received response<span
                id="execution-response-status-POSTapi-tool-status-logs"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-POSTapi-tool-status-logs"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-POSTapi-tool-status-logs" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-POSTapi-tool-status-logs">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-POSTapi-tool-status-logs" data-method="POST"
      data-path="api/tool-status-logs"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('POSTapi-tool-status-logs', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-POSTapi-tool-status-logs"
                    onclick="tryItOut('POSTapi-tool-status-logs');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-POSTapi-tool-status-logs"
                    onclick="cancelTryOut('POSTapi-tool-status-logs');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-POSTapi-tool-status-logs"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-black">POST</small>
            <b><code>api/tool-status-logs</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="POSTapi-tool-status-logs"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="POSTapi-tool-status-logs"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <h4 class="fancy-heading-panel"><b>Body Parameters</b></h4>
        <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>tool_id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool_id"                data-endpoint="POSTapi-tool-status-logs"
               value="1"
               data-component="body">
    <br>
<p>The ID of the tool. Example: <code>1</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>old_status</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="old_status"                data-endpoint="POSTapi-tool-status-logs"
               value="AVAILABLE"
               data-component="body">
    <br>
<p>The previous status. Example: <code>AVAILABLE</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>new_status</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="new_status"                data-endpoint="POSTapi-tool-status-logs"
               value="MAINTENANCE"
               data-component="body">
    <br>
<p>The new status. Example: <code>MAINTENANCE</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>changed_by</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="changed_by"                data-endpoint="POSTapi-tool-status-logs"
               value="1"
               data-component="body">
    <br>
<p>The ID of the user who made the change. Example: <code>1</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>changed_at</code></b>&nbsp;&nbsp;
<small>datetime</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="changed_at"                data-endpoint="POSTapi-tool-status-logs"
               value="2026-01-29T10:00:00Z"
               data-component="body">
    <br>
<p>The timestamp of the change. Example: <code>2026-01-29T10:00:00Z</code></p>
        </div>
        </form>

                    <h2 id="tool-status-logs-GETapi-tool-status-logs--id-">Get a tool status log</h2>

<p>
</p>

<p>Get details of a specific tool status log entry.</p>

<span id="example-requests-GETapi-tool-status-logs--id-">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request GET \
    --get "http://toolsync.test/api/tool-status-logs/16" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json"</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tool-status-logs/16"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

fetch(url, {
    method: "GET",
    headers,
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-GETapi-tool-status-logs--id-">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;data&quot;: {
        &quot;id&quot;: 1,
        &quot;tool_id&quot;: 1,
        &quot;old_status&quot;: &quot;AVAILABLE&quot;,
        &quot;new_status&quot;: &quot;MAINTENANCE&quot;,
        &quot;changed_by&quot;: 1,
        &quot;changed_at&quot;: &quot;2026-01-29T10:00:00.000000Z&quot;,
        &quot;created_at&quot;: &quot;2026-01-29T10:00:00.000000Z&quot;,
        &quot;updated_at&quot;: &quot;2026-01-29T10:00:00.000000Z&quot;,
        &quot;tool&quot;: {
            &quot;id&quot;: 1,
            &quot;name&quot;: &quot;Laptop&quot;
        },
        &quot;changed_by_user&quot;: {
            &quot;id&quot;: 1,
            &quot;name&quot;: &quot;Admin User&quot;
        }
    }
}</code>
 </pre>
    </span>
<span id="execution-results-GETapi-tool-status-logs--id-" hidden>
    <blockquote>Received response<span
                id="execution-response-status-GETapi-tool-status-logs--id-"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-GETapi-tool-status-logs--id-"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-GETapi-tool-status-logs--id-" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-GETapi-tool-status-logs--id-">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-GETapi-tool-status-logs--id-" data-method="GET"
      data-path="api/tool-status-logs/{id}"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('GETapi-tool-status-logs--id-', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-GETapi-tool-status-logs--id-"
                    onclick="tryItOut('GETapi-tool-status-logs--id-');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-GETapi-tool-status-logs--id-"
                    onclick="cancelTryOut('GETapi-tool-status-logs--id-');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-GETapi-tool-status-logs--id-"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-green">GET</small>
            <b><code>api/tool-status-logs/{id}</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="GETapi-tool-status-logs--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="GETapi-tool-status-logs--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                        <h4 class="fancy-heading-panel"><b>URL Parameters</b></h4>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="id"                data-endpoint="GETapi-tool-status-logs--id-"
               value="16"
               data-component="url">
    <br>
<p>The ID of the tool status log. Example: <code>16</code></p>
            </div>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>tool_status_log</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool_status_log"                data-endpoint="GETapi-tool-status-logs--id-"
               value="1"
               data-component="url">
    <br>
<p>The ID of the status log. Example: <code>1</code></p>
            </div>
                    </form>

                    <h2 id="tool-status-logs-PUTapi-tool-status-logs--id-">Update a tool status log</h2>

<p>
</p>

<p>Update an existing tool status log entry.</p>

<span id="example-requests-PUTapi-tool-status-logs--id-">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request PUT \
    "http://toolsync.test/api/tool-status-logs/16" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --data "{
    \"old_status\": \"AVAILABLE\",
    \"new_status\": \"BORROWED\",
    \"changed_by\": 1,
    \"changed_at\": \"2026-01-29T10:00:00Z\"
}"
</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tool-status-logs/16"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

let body = {
    "old_status": "AVAILABLE",
    "new_status": "BORROWED",
    "changed_by": 1,
    "changed_at": "2026-01-29T10:00:00Z"
};

fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-PUTapi-tool-status-logs--id-">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;message&quot;: &quot;Tool status log updated successfully.&quot;,
    &quot;data&quot;: {
        &quot;id&quot;: 1,
        &quot;tool_id&quot;: 1,
        &quot;old_status&quot;: &quot;AVAILABLE&quot;,
        &quot;new_status&quot;: &quot;BORROWED&quot;,
        &quot;changed_by&quot;: 1,
        &quot;changed_at&quot;: &quot;2026-01-29T10:00:00.000000Z&quot;,
        &quot;created_at&quot;: &quot;2026-01-29T10:00:00.000000Z&quot;,
        &quot;updated_at&quot;: &quot;2026-01-29T10:00:00.000000Z&quot;,
        &quot;tool&quot;: {
            &quot;id&quot;: 1,
            &quot;name&quot;: &quot;Laptop&quot;
        },
        &quot;changed_by_user&quot;: {
            &quot;id&quot;: 1,
            &quot;name&quot;: &quot;Admin User&quot;
        }
    }
}</code>
 </pre>
    </span>
<span id="execution-results-PUTapi-tool-status-logs--id-" hidden>
    <blockquote>Received response<span
                id="execution-response-status-PUTapi-tool-status-logs--id-"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-PUTapi-tool-status-logs--id-"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-PUTapi-tool-status-logs--id-" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-PUTapi-tool-status-logs--id-">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-PUTapi-tool-status-logs--id-" data-method="PUT"
      data-path="api/tool-status-logs/{id}"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('PUTapi-tool-status-logs--id-', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-PUTapi-tool-status-logs--id-"
                    onclick="tryItOut('PUTapi-tool-status-logs--id-');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-PUTapi-tool-status-logs--id-"
                    onclick="cancelTryOut('PUTapi-tool-status-logs--id-');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-PUTapi-tool-status-logs--id-"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-darkblue">PUT</small>
            <b><code>api/tool-status-logs/{id}</code></b>
        </p>
            <p>
            <small class="badge badge-purple">PATCH</small>
            <b><code>api/tool-status-logs/{id}</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="PUTapi-tool-status-logs--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="PUTapi-tool-status-logs--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                        <h4 class="fancy-heading-panel"><b>URL Parameters</b></h4>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="id"                data-endpoint="PUTapi-tool-status-logs--id-"
               value="16"
               data-component="url">
    <br>
<p>The ID of the tool status log. Example: <code>16</code></p>
            </div>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>tool_status_log</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool_status_log"                data-endpoint="PUTapi-tool-status-logs--id-"
               value="1"
               data-component="url">
    <br>
<p>The ID of the status log. Example: <code>1</code></p>
            </div>
                            <h4 class="fancy-heading-panel"><b>Body Parameters</b></h4>
        <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>old_status</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="old_status"                data-endpoint="PUTapi-tool-status-logs--id-"
               value="AVAILABLE"
               data-component="body">
    <br>
<p>The previous status. Example: <code>AVAILABLE</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>new_status</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="new_status"                data-endpoint="PUTapi-tool-status-logs--id-"
               value="BORROWED"
               data-component="body">
    <br>
<p>The new status. Example: <code>BORROWED</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>changed_by</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="changed_by"                data-endpoint="PUTapi-tool-status-logs--id-"
               value="1"
               data-component="body">
    <br>
<p>The ID of the user who made the change. Example: <code>1</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>changed_at</code></b>&nbsp;&nbsp;
<small>datetime</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="changed_at"                data-endpoint="PUTapi-tool-status-logs--id-"
               value="2026-01-29T10:00:00Z"
               data-component="body">
    <br>
<p>The timestamp of the change. Example: <code>2026-01-29T10:00:00Z</code></p>
        </div>
        </form>

                    <h2 id="tool-status-logs-DELETEapi-tool-status-logs--id-">Delete a tool status log</h2>

<p>
</p>

<p>Delete a tool status log entry.</p>

<span id="example-requests-DELETEapi-tool-status-logs--id-">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request DELETE \
    "http://toolsync.test/api/tool-status-logs/16" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json"</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tool-status-logs/16"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

fetch(url, {
    method: "DELETE",
    headers,
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-DELETEapi-tool-status-logs--id-">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;message&quot;: &quot;Tool status log deleted successfully.&quot;
}</code>
 </pre>
    </span>
<span id="execution-results-DELETEapi-tool-status-logs--id-" hidden>
    <blockquote>Received response<span
                id="execution-response-status-DELETEapi-tool-status-logs--id-"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-DELETEapi-tool-status-logs--id-"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-DELETEapi-tool-status-logs--id-" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-DELETEapi-tool-status-logs--id-">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-DELETEapi-tool-status-logs--id-" data-method="DELETE"
      data-path="api/tool-status-logs/{id}"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('DELETEapi-tool-status-logs--id-', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-DELETEapi-tool-status-logs--id-"
                    onclick="tryItOut('DELETEapi-tool-status-logs--id-');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-DELETEapi-tool-status-logs--id-"
                    onclick="cancelTryOut('DELETEapi-tool-status-logs--id-');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-DELETEapi-tool-status-logs--id-"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-red">DELETE</small>
            <b><code>api/tool-status-logs/{id}</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="DELETEapi-tool-status-logs--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="DELETEapi-tool-status-logs--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                        <h4 class="fancy-heading-panel"><b>URL Parameters</b></h4>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="id"                data-endpoint="DELETEapi-tool-status-logs--id-"
               value="16"
               data-component="url">
    <br>
<p>The ID of the tool status log. Example: <code>16</code></p>
            </div>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>tool_status_log</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool_status_log"                data-endpoint="DELETEapi-tool-status-logs--id-"
               value="1"
               data-component="url">
    <br>
<p>The ID of the status log. Example: <code>1</code></p>
            </div>
                    </form>

                <h1 id="tools">Tools</h1>

    <p>APIs for managing tools</p>

                                <h2 id="tools-GETapi-tools">List all tools</h2>

<p>
</p>

<p>Get a list of all tools with optional filters.</p>

<span id="example-requests-GETapi-tools">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request GET \
    --get "http://toolsync.test/api/tools?status=AVAILABLE&amp;category_id=1&amp;search=Laptop" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json"</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tools"
);

const params = {
    "status": "AVAILABLE",
    "category_id": "1",
    "search": "Laptop",
};
Object.keys(params)
    .forEach(key =&gt; url.searchParams.append(key, params[key]));

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

fetch(url, {
    method: "GET",
    headers,
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-GETapi-tools">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;data&quot;: [
        {
            &quot;id&quot;: 1,
            &quot;name&quot;: &quot;Laptop&quot;,
            &quot;description&quot;: &quot;Portable laptop for academic use&quot;,
            &quot;image_path&quot;: &quot;images/tools/laptop.png&quot;,
            &quot;category_id&quot;: 1,
            &quot;status&quot;: &quot;AVAILABLE&quot;,
            &quot;quantity&quot;: 5,
            &quot;created_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
            &quot;updated_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
            &quot;category&quot;: {
                &quot;id&quot;: 1,
                &quot;name&quot;: &quot;IT Equipment&quot;
            }
        }
    ]
}</code>
 </pre>
    </span>
<span id="execution-results-GETapi-tools" hidden>
    <blockquote>Received response<span
                id="execution-response-status-GETapi-tools"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-GETapi-tools"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-GETapi-tools" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-GETapi-tools">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-GETapi-tools" data-method="GET"
      data-path="api/tools"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('GETapi-tools', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-GETapi-tools"
                    onclick="tryItOut('GETapi-tools');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-GETapi-tools"
                    onclick="cancelTryOut('GETapi-tools');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-GETapi-tools"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-green">GET</small>
            <b><code>api/tools</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="GETapi-tools"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="GETapi-tools"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                            <h4 class="fancy-heading-panel"><b>Query Parameters</b></h4>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>status</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="status"                data-endpoint="GETapi-tools"
               value="AVAILABLE"
               data-component="query">
    <br>
<p>Filter by status. Example: <code>AVAILABLE</code></p>
            </div>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>category_id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="category_id"                data-endpoint="GETapi-tools"
               value="1"
               data-component="query">
    <br>
<p>Filter by category ID. Example: <code>1</code></p>
            </div>
                                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>search</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="search"                data-endpoint="GETapi-tools"
               value="Laptop"
               data-component="query">
    <br>
<p>Search by tool name. Example: <code>Laptop</code></p>
            </div>
                </form>

                    <h2 id="tools-POSTapi-tools">Create a tool</h2>

<p>
</p>

<p>Create a new tool.</p>

<span id="example-requests-POSTapi-tools">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request POST \
    "http://toolsync.test/api/tools" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --data "{
    \"name\": \"Laptop\",
    \"description\": \"Portable laptop for academic use\",
    \"image_path\": \"images\\/tools\\/laptop.png\",
    \"category_id\": 1,
    \"status\": \"AVAILABLE\",
    \"quantity\": 5
}"
</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tools"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

let body = {
    "name": "Laptop",
    "description": "Portable laptop for academic use",
    "image_path": "images\/tools\/laptop.png",
    "category_id": 1,
    "status": "AVAILABLE",
    "quantity": 5
};

fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-POSTapi-tools">
            <blockquote>
            <p>Example response (201):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;message&quot;: &quot;Tool created successfully.&quot;,
    &quot;data&quot;: {
        &quot;id&quot;: 1,
        &quot;name&quot;: &quot;Laptop&quot;,
        &quot;description&quot;: &quot;Portable laptop for academic use&quot;,
        &quot;image_path&quot;: &quot;images/tools/laptop.png&quot;,
        &quot;category_id&quot;: 1,
        &quot;status&quot;: &quot;AVAILABLE&quot;,
        &quot;quantity&quot;: 5,
        &quot;created_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
        &quot;updated_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
        &quot;category&quot;: {
            &quot;id&quot;: 1,
            &quot;name&quot;: &quot;IT Equipment&quot;
        }
    }
}</code>
 </pre>
    </span>
<span id="execution-results-POSTapi-tools" hidden>
    <blockquote>Received response<span
                id="execution-response-status-POSTapi-tools"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-POSTapi-tools"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-POSTapi-tools" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-POSTapi-tools">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-POSTapi-tools" data-method="POST"
      data-path="api/tools"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('POSTapi-tools', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-POSTapi-tools"
                    onclick="tryItOut('POSTapi-tools');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-POSTapi-tools"
                    onclick="cancelTryOut('POSTapi-tools');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-POSTapi-tools"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-black">POST</small>
            <b><code>api/tools</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="POSTapi-tools"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="POSTapi-tools"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <h4 class="fancy-heading-panel"><b>Body Parameters</b></h4>
        <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>name</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="name"                data-endpoint="POSTapi-tools"
               value="Laptop"
               data-component="body">
    <br>
<p>The name of the tool. Example: <code>Laptop</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>description</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="description"                data-endpoint="POSTapi-tools"
               value="Portable laptop for academic use"
               data-component="body">
    <br>
<p>The description of the tool. Example: <code>Portable laptop for academic use</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>image_path</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="image_path"                data-endpoint="POSTapi-tools"
               value="images/tools/laptop.png"
               data-component="body">
    <br>
<p>The image path of the tool. Example: <code>images/tools/laptop.png</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>category_id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="category_id"                data-endpoint="POSTapi-tools"
               value="1"
               data-component="body">
    <br>
<p>The category ID. Example: <code>1</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>status</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="status"                data-endpoint="POSTapi-tools"
               value="AVAILABLE"
               data-component="body">
    <br>
<p>The status of the tool. Example: <code>AVAILABLE</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>quantity</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="quantity"                data-endpoint="POSTapi-tools"
               value="5"
               data-component="body">
    <br>
<p>The quantity available. Example: <code>5</code></p>
        </div>
        </form>

                    <h2 id="tools-GETapi-tools--id-">Get a tool</h2>

<p>
</p>

<p>Get details of a specific tool.</p>

<span id="example-requests-GETapi-tools--id-">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request GET \
    --get "http://toolsync.test/api/tools/1" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json"</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tools/1"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

fetch(url, {
    method: "GET",
    headers,
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-GETapi-tools--id-">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;data&quot;: {
        &quot;id&quot;: 1,
        &quot;name&quot;: &quot;Laptop&quot;,
        &quot;description&quot;: &quot;Portable laptop for academic use&quot;,
        &quot;image_path&quot;: &quot;images/tools/laptop.png&quot;,
        &quot;category_id&quot;: 1,
        &quot;status&quot;: &quot;AVAILABLE&quot;,
        &quot;quantity&quot;: 5,
        &quot;created_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
        &quot;updated_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
        &quot;category&quot;: {
            &quot;id&quot;: 1,
            &quot;name&quot;: &quot;IT Equipment&quot;
        }
    }
}</code>
 </pre>
    </span>
<span id="execution-results-GETapi-tools--id-" hidden>
    <blockquote>Received response<span
                id="execution-response-status-GETapi-tools--id-"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-GETapi-tools--id-"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-GETapi-tools--id-" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-GETapi-tools--id-">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-GETapi-tools--id-" data-method="GET"
      data-path="api/tools/{id}"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('GETapi-tools--id-', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-GETapi-tools--id-"
                    onclick="tryItOut('GETapi-tools--id-');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-GETapi-tools--id-"
                    onclick="cancelTryOut('GETapi-tools--id-');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-GETapi-tools--id-"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-green">GET</small>
            <b><code>api/tools/{id}</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="GETapi-tools--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="GETapi-tools--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                        <h4 class="fancy-heading-panel"><b>URL Parameters</b></h4>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="id"                data-endpoint="GETapi-tools--id-"
               value="1"
               data-component="url">
    <br>
<p>The ID of the tool. Example: <code>1</code></p>
            </div>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>tool</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool"                data-endpoint="GETapi-tools--id-"
               value="1"
               data-component="url">
    <br>
<p>The ID of the tool. Example: <code>1</code></p>
            </div>
                    </form>

                    <h2 id="tools-PUTapi-tools--id-">Update a tool</h2>

<p>
</p>

<p>Update an existing tool.</p>

<span id="example-requests-PUTapi-tools--id-">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request PUT \
    "http://toolsync.test/api/tools/1" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --data "{
    \"name\": \"Laptop Pro\",
    \"description\": \"High-performance laptop\",
    \"image_path\": \"images\\/tools\\/laptop-pro.png\",
    \"category_id\": 1,
    \"status\": \"MAINTENANCE\",
    \"quantity\": 3
}"
</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tools/1"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

let body = {
    "name": "Laptop Pro",
    "description": "High-performance laptop",
    "image_path": "images\/tools\/laptop-pro.png",
    "category_id": 1,
    "status": "MAINTENANCE",
    "quantity": 3
};

fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-PUTapi-tools--id-">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;message&quot;: &quot;Tool updated successfully.&quot;,
    &quot;data&quot;: {
        &quot;id&quot;: 1,
        &quot;name&quot;: &quot;Laptop Pro&quot;,
        &quot;description&quot;: &quot;High-performance laptop&quot;,
        &quot;image_path&quot;: &quot;images/tools/laptop-pro.png&quot;,
        &quot;category_id&quot;: 1,
        &quot;status&quot;: &quot;MAINTENANCE&quot;,
        &quot;quantity&quot;: 3,
        &quot;created_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
        &quot;updated_at&quot;: &quot;2026-01-29T00:00:00.000000Z&quot;,
        &quot;category&quot;: {
            &quot;id&quot;: 1,
            &quot;name&quot;: &quot;IT Equipment&quot;
        }
    }
}</code>
 </pre>
    </span>
<span id="execution-results-PUTapi-tools--id-" hidden>
    <blockquote>Received response<span
                id="execution-response-status-PUTapi-tools--id-"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-PUTapi-tools--id-"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-PUTapi-tools--id-" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-PUTapi-tools--id-">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-PUTapi-tools--id-" data-method="PUT"
      data-path="api/tools/{id}"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('PUTapi-tools--id-', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-PUTapi-tools--id-"
                    onclick="tryItOut('PUTapi-tools--id-');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-PUTapi-tools--id-"
                    onclick="cancelTryOut('PUTapi-tools--id-');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-PUTapi-tools--id-"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-darkblue">PUT</small>
            <b><code>api/tools/{id}</code></b>
        </p>
            <p>
            <small class="badge badge-purple">PATCH</small>
            <b><code>api/tools/{id}</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="PUTapi-tools--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="PUTapi-tools--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                        <h4 class="fancy-heading-panel"><b>URL Parameters</b></h4>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="id"                data-endpoint="PUTapi-tools--id-"
               value="1"
               data-component="url">
    <br>
<p>The ID of the tool. Example: <code>1</code></p>
            </div>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>tool</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool"                data-endpoint="PUTapi-tools--id-"
               value="1"
               data-component="url">
    <br>
<p>The ID of the tool. Example: <code>1</code></p>
            </div>
                            <h4 class="fancy-heading-panel"><b>Body Parameters</b></h4>
        <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>name</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="name"                data-endpoint="PUTapi-tools--id-"
               value="Laptop Pro"
               data-component="body">
    <br>
<p>The name of the tool. Example: <code>Laptop Pro</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>description</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="description"                data-endpoint="PUTapi-tools--id-"
               value="High-performance laptop"
               data-component="body">
    <br>
<p>The description of the tool. Example: <code>High-performance laptop</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>image_path</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="image_path"                data-endpoint="PUTapi-tools--id-"
               value="images/tools/laptop-pro.png"
               data-component="body">
    <br>
<p>The image path of the tool. Example: <code>images/tools/laptop-pro.png</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>category_id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="category_id"                data-endpoint="PUTapi-tools--id-"
               value="1"
               data-component="body">
    <br>
<p>The category ID. Example: <code>1</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>status</code></b>&nbsp;&nbsp;
<small>string</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="status"                data-endpoint="PUTapi-tools--id-"
               value="MAINTENANCE"
               data-component="body">
    <br>
<p>The status of the tool. Example: <code>MAINTENANCE</code></p>
        </div>
                <div style=" padding-left: 28px;  clear: unset;">
            <b style="line-height: 2;"><code>quantity</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
<i>optional</i> &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="quantity"                data-endpoint="PUTapi-tools--id-"
               value="3"
               data-component="body">
    <br>
<p>The quantity available. Example: <code>3</code></p>
        </div>
        </form>

                    <h2 id="tools-DELETEapi-tools--id-">Delete a tool</h2>

<p>
</p>

<p>Delete a tool from the system.</p>

<span id="example-requests-DELETEapi-tools--id-">
<blockquote>Example request:</blockquote>


<div class="bash-example">
    <pre><code class="language-bash">curl --request DELETE \
    "http://toolsync.test/api/tools/1" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json"</code></pre></div>


<div class="javascript-example">
    <pre><code class="language-javascript">const url = new URL(
    "http://toolsync.test/api/tools/1"
);

const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

fetch(url, {
    method: "DELETE",
    headers,
}).then(response =&gt; response.json());</code></pre></div>

</span>

<span id="example-responses-DELETEapi-tools--id-">
            <blockquote>
            <p>Example response (200):</p>
        </blockquote>
                <pre>

<code class="language-json" style="max-height: 300px;">{
    &quot;message&quot;: &quot;Tool deleted successfully.&quot;
}</code>
 </pre>
    </span>
<span id="execution-results-DELETEapi-tools--id-" hidden>
    <blockquote>Received response<span
                id="execution-response-status-DELETEapi-tools--id-"></span>:
    </blockquote>
    <pre class="json"><code id="execution-response-content-DELETEapi-tools--id-"
      data-empty-response-text="<Empty response>" style="max-height: 400px;"></code></pre>
</span>
<span id="execution-error-DELETEapi-tools--id-" hidden>
    <blockquote>Request failed with error:</blockquote>
    <pre><code id="execution-error-message-DELETEapi-tools--id-">

Tip: Check that you&#039;re properly connected to the network.
If you&#039;re a maintainer of ths API, verify that your API is running and you&#039;ve enabled CORS.
You can check the Dev Tools console for debugging information.</code></pre>
</span>
<form id="form-DELETEapi-tools--id-" data-method="DELETE"
      data-path="api/tools/{id}"
      data-authed="0"
      data-hasfiles="0"
      data-isarraybody="0"
      autocomplete="off"
      onsubmit="event.preventDefault(); executeTryOut('DELETEapi-tools--id-', this);">
    <h3>
        Request&nbsp;&nbsp;&nbsp;
                    <button type="button"
                    style="background-color: #8fbcd4; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-tryout-DELETEapi-tools--id-"
                    onclick="tryItOut('DELETEapi-tools--id-');">Try it out ⚡
            </button>
            <button type="button"
                    style="background-color: #c97a7e; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-canceltryout-DELETEapi-tools--id-"
                    onclick="cancelTryOut('DELETEapi-tools--id-');" hidden>Cancel 🛑
            </button>&nbsp;&nbsp;
            <button type="submit"
                    style="background-color: #6ac174; padding: 5px 10px; border-radius: 5px; border-width: thin;"
                    id="btn-executetryout-DELETEapi-tools--id-"
                    data-initial-text="Send Request 💥"
                    data-loading-text="⏱ Sending..."
                    hidden>Send Request 💥
            </button>
            </h3>
            <p>
            <small class="badge badge-red">DELETE</small>
            <b><code>api/tools/{id}</code></b>
        </p>
                <h4 class="fancy-heading-panel"><b>Headers</b></h4>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Content-Type</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Content-Type"                data-endpoint="DELETEapi-tools--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                                <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>Accept</code></b>&nbsp;&nbsp;
&nbsp;
 &nbsp;
 &nbsp;
                <input type="text" style="display: none"
                              name="Accept"                data-endpoint="DELETEapi-tools--id-"
               value="application/json"
               data-component="header">
    <br>
<p>Example: <code>application/json</code></p>
            </div>
                        <h4 class="fancy-heading-panel"><b>URL Parameters</b></h4>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>id</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="id"                data-endpoint="DELETEapi-tools--id-"
               value="1"
               data-component="url">
    <br>
<p>The ID of the tool. Example: <code>1</code></p>
            </div>
                    <div style="padding-left: 28px; clear: unset;">
                <b style="line-height: 2;"><code>tool</code></b>&nbsp;&nbsp;
<small>integer</small>&nbsp;
 &nbsp;
 &nbsp;
                <input type="number" style="display: none"
               step="any"               name="tool"                data-endpoint="DELETEapi-tools--id-"
               value="1"
               data-component="url">
    <br>
<p>The ID of the tool. Example: <code>1</code></p>
            </div>
                    </form>

            

        
    </div>
    <div class="dark-box">
                    <div class="lang-selector">
                                                        <button type="button" class="lang-button" data-language-name="bash">bash</button>
                                                        <button type="button" class="lang-button" data-language-name="javascript">javascript</button>
                            </div>
            </div>
</div>
</body>
</html>
