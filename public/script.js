function toggleVerificationButton() {
    const termsCheckbox = document.getElementById('terms');
    const getCodeBtn = document.getElementById('getCodeBtn');
    getCodeBtn.disabled = !termsCheckbox.checked;
}

function getDate() {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
function generateContractCode() {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
}
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('numberContract').textContent = generateContractCode();
});
// Thêm hàm để cập nhật ngày khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('currentDate').textContent = getDate();
});

async function sendVerificationCode() {
    const email = document.getElementById('email').value;
    
    if (!email) {
        toast({
            title: 'Error',
            message: 'Vui lòng nhập email',
            type: 'error',
            duration: 5000
        });
        return;
    }
    
    try {
        const response = await fetch('https://binhvuong.id.vn/send-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.toast) {
            toast(data.toast);
        }
    } catch (error) {
        toast({
            title: 'Error',
            message: 'Đã xảy ra lỗi. Vui lòng thử lại.',
            type: 'error',
            duration: 5000
        });
    }
}

async function generateAndSendPDF() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const cccd = document.getElementById('cccd').value;
    const email = document.getElementById('email').value;

    const docDefinition = {
        content: [
            { text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', style: 'header', alignment: 'center' },
            { text: 'Độc lập – Tự do – Hạnh phúc', style: 'subheader', alignment: 'center' },
            { text: '-------------------------------', alignment: 'center', margin: [0, 0, 0, 10] },
            { text: 'HỢP ĐỒNG CHO THUÊ XE', style: 'title', alignment: 'center', margin: [0, 10, 0, 0] },
            { text: `Ngày: ${getDate()}`, alignment: 'center' },
            { text: 'Số: …………………………', alignment: 'center', margin: [0, 0, 0, 20] },

            { text: 'BÊN A', style: 'section' },
            { text: `Tên: ${name}` },
            { text: `Số điện thoại: ${phone}` },
            { text: `CCCD: ${cccd}` },
            { text: `Mail: ${email}`, margin: [0, 0, 0, 10] },

            { text: 'BÊN B', style: 'section' },
            { text: 'Tên: Cty TNHH Group2' },
            { text: 'Số điện thoại: 0394672210' },
            { text: 'Mail: Binhvuong221004@gmail.com', margin: [0, 0, 0, 20] },
            { text: 'Bên B đã đồng ý sử dụng dịch vụ abcxyz của bên A....', margin: [0, 0, 0, 20] },

            {
                columns: [
                    [
                        { text: 'BÊN A:', style: 'section' },
                        { text: `Tên: ${name}` },
                        { text: 'Đã kí online "verify code"', italics: true }
                    ],
                    [
                        { text: 'BÊN B:', style: 'section' },
                        { text: 'Tên: Group2' },
                        { text: 'Đã ký!' }
                    ]
                ]
            }
        ],
        styles: {
            header: { fontSize: 14, bold: true },
            subheader: { fontSize: 12, italics: true },
            title: { fontSize: 16, bold: true },
            section: { fontSize: 13, bold: true, margin: [0, 10, 0, 5] }
        },
        defaultStyle: {
            font: 'Roboto'
        }
    };

    // Tạo PDF và gửi về server
    pdfMake.createPdf(docDefinition).getBlob(async function(blob) {
        const formData = new FormData();
        formData.append('pdf', blob, 'hopdong.pdf');
        formData.append('email', email);

        try {
            const response = await fetch('https://binhvuong.id.vn/send-pdf', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.toast) {
                toast(data.toast);
            }
        } catch (error) {
            toast({
                title: 'Error',
                message: 'Đã xảy ra lỗi khi gửi PDF. Vui lòng thử lại.',
                type: 'error',
                duration: 5000
            });
        }
    });
}

async function verifyCode() {
    const email = document.getElementById('email').value;
    const code = document.getElementById('code').value;
    const name = document.getElementById('name').value;
    
    if (!email || !code) {
        toast({
            title: 'Error',
            message: 'Vui lòng nhập đầy đủ email và mã xác nhận',
            type: 'error',
            duration: 5000
        });
        return;
    }
    
    try {
        const response = await fetch('https://binhvuong.id.vn/verify-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, code })
        });
        
        const data = await response.json();
        
        if (data.toast) {
            toast(data.toast);
        }

        if (data.success) {
            document.getElementById('signedName').textContent = name;
            document.getElementById('verificationStatus').textContent = 'Đã xác nhận';
            await generateAndSendPDF();
        }
    } catch (error) {
        toast({
            title: 'Error',
            message: 'Đã xảy ra lỗi. Vui lòng thử lại.',
            type: 'error',
            duration: 5000
        });
    }
} 