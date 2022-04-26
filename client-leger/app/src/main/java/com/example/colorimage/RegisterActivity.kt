package com.example.colorimage

import android.content.Intent
import android.graphics.Bitmap
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.util.Log
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.ActivityResult
import androidx.activity.result.contract.ActivityResultContracts.StartActivityForResult
import androidx.annotation.RequiresApi
import androidx.databinding.DataBindingUtil
import com.example.colorimage.avatar_dialog.AvatarListAdapter
import com.example.colorimage.avatar_dialog.AvatarListViewDialog
import com.example.colorimage.databinding.ActivityRegisterBinding
import com.example.colorimage.http.RegisterRequest
import com.example.colorimage.http.RegisterResponse
import com.example.colorimage.utils.ErrorMessages
import com.example.colorimage.utils.RequestsResponses
import com.example.colorimage.utils.Utils
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking


class RegisterActivity : BaseActivity(), AvatarListAdapter.RecyclerViewItemClickListener {

    private lateinit var binding: ActivityRegisterBinding
    internal var avatarDialog: AvatarListViewDialog? = null

    private var currentAvatarId: Int = -1

    var imageIdList = arrayOf<Int>(
        R.drawable.avatar1,
        R.drawable.avatar2,
        R.drawable.avatar3,
        R.drawable.avatar4,
        R.drawable.avatar5
    )


    @RequiresApi(Build.VERSION_CODES.N)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = DataBindingUtil.setContentView(this, R.layout.activity_register)
        runOnUiThread {
            findViewById<TextView>(R.id.register_page_title).text =
                getStr(R.string.register_page_title)
            findViewById<TextInputLayout>(R.id.email_text_input_layout).hint =
                getStr(R.string.email)
            findViewById<TextInputEditText>(R.id.email_text_input_edit).hint =
                getStr(R.string.email)
            findViewById<TextInputLayout>(R.id.password_text_input_layout).hint =
                getStr(R.string.password)
            findViewById<TextInputEditText>(R.id.password_text_input_edit).hint =
                getStr(R.string.password)
            findViewById<TextInputEditText>(R.id.nickname_text_input_edit).hint = getStr(R.string.nickname)
            findViewById<TextInputLayout>(R.id.nickname_text_input_layout).hint = getStr(R.string.nickname)
            findViewById<Button>(R.id.register_button).text = getStr(R.string.register_button)
            findViewById<TextView>(R.id.go_to_login_activity_link).text =
                getStr(R.string.have_an_account_login)
        }

        // Set buttons click listener
        binding.goToLoginActivityLink.setOnClickListener { onGoToLoginActivityButtonClick() }
        binding.registerButton.setOnClickListener { onRegisterButtonClick() }
        binding.userAvatar.setOnClickListener { selectAvatar() }

    }

    fun selectAvatar() {
        val dataAdapter = AvatarListAdapter(imageIdList, this)
        avatarDialog = AvatarListViewDialog(this, dataAdapter)
        avatarDialog!!.show()
    }

    override fun clickOnItem(index: Int) {
        if (avatarDialog != null) {
            binding.userAvatar.setImageResource(imageIdList[index])
            currentAvatarId = index
            avatarDialog!!.dismiss()
        }
    }

    private fun capturePhoto() {
        val cameraIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        launcher.launch(cameraIntent)
    }

    private val launcher = registerForActivityResult(
        StartActivityForResult()
    ) { result: ActivityResult ->
        if (result.resultCode == RESULT_OK
            && result.data != null
        ) {
            // val photoUri: Uri? = result.data!!.data
            val bitmap = result.data!!.extras!!.get("data") as Bitmap
            binding.userAvatar.setImageBitmap(bitmap)
        }
    }

    private fun onGoToLoginActivityButtonClick() {
        goToLoginActivity()
    }

    private fun onRegisterButtonClick() {
        runBlocking {
            launch {
                if (performRegister()) {
                    goToLoginActivity()
                }
            }
        }
    }

    fun getStr(ref: Int): String = languageManager.localizedContext!!.getString(ref)

    private fun goToLoginActivity() {
        val intent = Intent(this, MainActivity::class.java)
        intent.putExtra("prev", "register")
        startActivity(intent)
        overridePendingTransition(android.R.anim.slide_in_left, android.R.anim.slide_in_left)
    }

    private suspend fun performRegister(): Boolean {
        val emailIsValid = isEmailValid()
        val nicknameIsValid = isNicknameValid()
        val passwordIsValid = isPasswordIsValid()
        val avatarIsValid = isAvatarValid()

        if (!emailIsValid || !nicknameIsValid || !passwordIsValid || !avatarIsValid) {
            return false
        }

        val email = binding.emailTextInputEdit.text.toString().trim()
        val nickname = binding.nicknameTextInputEdit.text.toString().trim()
        val password = binding.passwordTextInputEdit.text.toString().trim()
        var errorMessage: String? = null

        // perform register
        val registerRequest = RegisterRequest(email, password, nickname, currentAvatarId.toString())
        val registerResponse = sendRegisterUserRequest(registerRequest)
        Log.i("register", registerResponse?.message!!)
        when (registerResponse?.message) {
            RequestsResponses.SUCCESS -> return true
            RequestsResponses.FAILED -> errorMessage = ErrorMessages.EMAIL_ALREADY_USED
        }

        // Show error message from the server on the input
        binding.emailTextInputLayout.apply { error = errorMessage }

        return false
    }

    private fun isEmailValid(): Boolean {
        val email = binding.emailTextInputEdit.text.toString().trim()
        var errorMessage: String? = null

        if (email.isBlank()) {
            errorMessage = ErrorMessages.FIELD_CANT_BE_EMPTY
        } else if (!Utils.isEmailFormatValid(email)) {
            errorMessage = ErrorMessages.INVALID_EMAIL_ADDRESS
        }

        // show error message on the input
        binding.emailTextInputLayout.apply { error = errorMessage }

        return errorMessage == null
    }

    private fun isNicknameValid(): Boolean {
        val nickname = binding.nicknameTextInputEdit.text.toString().trim()
        var errorMessage: String? = null

        if (nickname.isBlank()) {
            errorMessage = ErrorMessages.FIELD_CANT_BE_EMPTY
        }

        // show error message on the input
        binding.nicknameTextInputLayout.apply { error = errorMessage }

        return errorMessage == null
    }

    private fun isPasswordIsValid(): Boolean {
        val password = binding.passwordTextInputEdit.text.toString().trim()
        var errorMessage: String? = null

        if (password.isBlank()) {
            errorMessage = "Ce champ ne peut pas être vide"
        } else if (password.length < 5) {
            errorMessage = "Le mot de passe doit avoir au moins 5 caractères"
        }

        // show error message on the input
        binding.passwordTextInputLayout.apply {
            isErrorEnabled = true
            error = errorMessage
        }

        return errorMessage == null
    }

    private fun isAvatarValid(): Boolean {
        if (currentAvatarId == -1) {
            Toast.makeText(this, "Vous devez choisir un avatar", Toast.LENGTH_SHORT).show()
        }
        return currentAvatarId != -1
    }

    private suspend fun sendRegisterUserRequest(registerRequest: RegisterRequest): RegisterResponse? {
        Log.i("REGISTER_REQUEST", registerRequest.toString())
        val registerResponse = httpService.register(registerRequest)
        Log.i("REGISTER_RESPONSE", registerResponse.toString())

        return registerResponse
    }

}