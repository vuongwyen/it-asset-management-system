<!DOCTYPE html>
<html lang="vi">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Biên bản bàn giao thiết bị</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.5;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header h3 {
            margin: 0;
            text-transform: uppercase;
        }

        .header p {
            margin: 5px 0;
            font-style: italic;
        }

        .title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 20px;
            text-transform: uppercase;
        }

        .section {
            margin-bottom: 20px;
        }

        .section-title {
            font-weight: bold;
            margin-bottom: 10px;
            text-transform: uppercase;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }

        th,
        td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
        }

        .commitment {
            margin-top: 20px;
            font-style: italic;
        }

        .signatures {
            margin-top: 50px;
            width: 100%;
        }

        .signatures td {
            border: none;
            text-align: center;
            vertical-align: top;
            width: 50%;
        }

        .signature-box {
            height: 100px;
        }
    </style>
</head>

<body>

    <div class="header">
        <h3>Cộng hòa xã hội chủ nghĩa Việt Nam</h3>
        <p>Độc lập - Tự do - Hạnh phúc</p>
        <p>---o0o---</p>
    </div>

    <div class="title">BIÊN BẢN BÀN GIAO THIẾT BỊ</div>

    <div class="section">
        <p>Hôm nay, ngày {{ now()->format('d') }} tháng {{ now()->format('m') }} năm {{ now()->format('Y') }}, tại văn phòng công ty, chúng tôi gồm:</p>
    </div>

    <div class="section">
        <div class="section-title">I. BÊN GIAO (Bên A):</div>
        <table style="border: none;">
            <tr style="border: none;">
                <td style="border: none; width: 150px;">Họ và tên:</td>
                <td style="border: none;"><strong>{{ $admin ? $admin->name : 'N/A' }}</strong></td>
            </tr>
            <tr style="border: none;">
                <td style="border: none;">Chức vụ/Bộ phận:</td>
                <td style="border: none;">IT / Admin</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">II. BÊN NHẬN (Bên B):</div>
        <table style="border: none;">
            <tr style="border: none;">
                <td style="border: none; width: 150px;">Họ và tên:</td>
                <td style="border: none;"><strong>{{ $user ? $user->name : 'N/A' }}</strong></td>
            </tr>
            <tr style="border: none;">
                <td style="border: none;">Email:</td>
                <td style="border: none;">{{ $user ? $user->email : 'N/A' }}</td>
            </tr>
            <tr style="border: none;">
                <td style="border: none;">Bộ phận:</td>
                <td style="border: none;">{{ $user && $user->department ? $user->department->name : 'N/A' }}</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <div class="section-title">III. NỘI DUNG BÀN GIAO:</div>
        <p>Bên A tiến hành bàn giao cho Bên B thiết bị với thông tin chi tiết như sau:</p>
        <table>
            <thead>
                <tr>
                    <th>STT</th>
                    <th>Tên thiết bị</th>
                    <th>Model</th>
                    <th>Serial / Tag</th>
                    <th>Tình trạng</th>
                    <th>Ghi chú</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>{{ $asset->name }}</td>
                    <td>{{ $asset->model ? $asset->model->name : '' }}</td>
                    <td>
                        Tag: {{ $asset->asset_tag }}<br>
                        SN: {{ $asset->serial }}
                    </td>
                    <td>{{ $asset->statusLabel ? $asset->statusLabel->name : '' }}</td>
                    <td>{{ $history->note }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="section commitment">
        <div class="section-title">IV. CAM KẾT:</div>
        <p>1. Bên B xác nhận đã nhận đầy đủ thiết bị đúng như mô tả ở trên, thiết bị hoạt động bình thường.</p>
        <p>2. Bên B cam kết bảo quản, sử dụng thiết bị đúng mục đích công việc.</p>
        <p>3. Trong trường hợp hỏng hóc, mất mát do lỗi chủ quan, Bên B chịu trách nhiệm bồi thường theo quy định của công ty.</p>
        <p>4. Khi nghỉ việc hoặc chuyển công tác, Bên B có trách nhiệm bàn giao lại thiết bị cho bộ phận IT.</p>
    </div>

    <table class="signatures">
        <tr>
            <td>
                <strong>ĐẠI DIỆN BÊN GIAO</strong><br>
                <i>(Ký, ghi rõ họ tên)</i>
                <div class="signature-box"></div>
                <strong>{{ $admin ? $admin->name : '' }}</strong>
            </td>
            <td>
                <strong>ĐẠI DIỆN BÊN NHẬN</strong><br>
                <i>(Ký, ghi rõ họ tên)</i>
                <div class="signature-box"></div>
                <strong>{{ $user ? $user->name : '' }}</strong>
            </td>
        </tr>
    </table>

</body>

</html>