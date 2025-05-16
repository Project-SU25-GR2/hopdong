const BASE_URL = 'https://binhvuong.id.vn';
// const BASE_URL = 'http://localhost:5137';
// const BASE_URL = 'http://192.168.1.127:5137';


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

let countdownInterval;
let timeLeft = 120; // 120 seconds = 2 minutes

function startCountdown() {
    const countdownElement = document.getElementById('countdown');
    const resendButton = document.getElementById('resendCodeBtn');
    const getCodeBtn = document.getElementById('getCodeBtn');
    
    // Disable both buttons initially
    resendButton.disabled = true;
    getCodeBtn.disabled = true;
    
    countdownInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        countdownElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            countdownElement.textContent = 'Hết hạn';
            resendButton.disabled = false;
            getCodeBtn.disabled = false;
        } else {
            timeLeft--;
        }
    }, 1000);
}

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
        const response = await fetch(`${BASE_URL}/send-code`, {
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
        
        if (data.success) {
            // Reset and start countdown
            timeLeft = 120;
            startCountdown();
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

async function resendVerificationCode() {
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
        const response = await fetch(`${BASE_URL}/resend-code`, {
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
        
        if (data.success) {
            // Reset and start countdown
            timeLeft = 120;
            startCountdown();
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
            { text: `Số HĐ: ${generateContractCode()}`, alignment: 'center', margin: [0, 0, 0, 20] },

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
            const response = await fetch(`${BASE_URL}/send-pdf`, {
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
    const verifyButton = document.getElementById('verifyBtn');
    
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
        const response = await fetch(`${BASE_URL}/verify-code`, {
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
            // Stop the countdown
            clearInterval(countdownInterval);
            document.getElementById('countdown').textContent = 'Đã xác nhận';
            
            // Change button color to blue
            verifyButton.style.backgroundColor = '#4CAF50';
            verifyButton.disabled = true;
            
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