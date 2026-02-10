<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your ToolSync account</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F5F7;font-family:Arial,Helvetica,sans-serif;color:#1F2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F5F7;padding:28px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background-color:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 10px 35px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background:linear-gradient(90deg,#060644 0%,#547792 100%);padding:20px 24px;">
                            <div style="font-size:22px;line-height:1.2;font-weight:800;color:#FFFFFF;">ToolSync</div>
                            <div style="margin-top:6px;font-size:13px;line-height:1.4;color:#DCE7F0;">Borrow smarter. Work faster.</div>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:28px 24px 20px;">
                            <h1 style="margin:0 0 14px;font-size:26px;line-height:1.25;color:#060644;">Verify your email</h1>
                            <p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:#4B5563;">
                                Welcome to ToolSync. Please verify your email address to activate your account and continue to your dashboard.
                            </p>
                            <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#6B7280;">
                                Account email: <strong style="color:#060644;">{{ $email }}</strong>
                            </p>
                            <table role="presentation" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="border-radius:10px;background-color:#547792;">
                                        <a href="{{ $url }}" target="_blank" rel="noopener" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:0 24px 24px;">
                            <div style="border-top:1px solid #E5E7EB;padding-top:16px;">
                                <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:#6B7280;">
                                    If the button does not work, copy and paste this link into your browser:
                                </p>
                                <p style="margin:0;word-break:break-all;font-size:12px;line-height:1.6;color:#1D4ED8;">
                                    <a href="{{ $url }}" target="_blank" rel="noopener" style="color:#1D4ED8;text-decoration:underline;">{{ $url }}</a>
                                </p>
                                <p style="margin:14px 0 0;font-size:12px;line-height:1.6;color:#9CA3AF;">
                                    If you did not create a ToolSync account, you can ignore this email.
                                </p>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
