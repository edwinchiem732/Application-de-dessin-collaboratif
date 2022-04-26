package com.example.colorimage

import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.media.MediaPlayer
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.animation.Animation
import android.view.animation.AnimationUtils
import android.widget.Button
import android.widget.TextView
import androidx.annotation.RequiresApi
import androidx.databinding.DataBindingUtil
import com.example.colorimage.SocketHandler.establishConnection
import com.example.colorimage.SocketHandler.setSingletonSocket
import com.example.colorimage.albums.AlbumsActivity
import com.example.colorimage.databinding.ActivityMainBinding
import com.example.colorimage.http.LeaveDrawingRequest
import com.example.colorimage.http.LoginRequest
import com.example.colorimage.http.LoginResponse
import com.example.colorimage.http.LogoutRequest
import com.example.colorimage.localization.LanguageManager
import com.example.colorimage.utils.ErrorMessages
import com.example.colorimage.utils.RequestsResponses
import com.example.colorimage.utils.Utils
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking


class MainActivity : BaseActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var sharedPref: SharedPreferences
    private lateinit var sharedPrefEdit: SharedPreferences.Editor
    @RequiresApi(Build.VERSION_CODES.N)
    lateinit var emailInput: TextInputEditText
    lateinit var passwordInput: TextInputEditText
    lateinit var emailInputLayout: TextInputLayout
    lateinit var passwordInputLayout: TextInputLayout
    lateinit var connectionButton: Button
    lateinit var createYourAccountButton: Button
    lateinit var parametersButton: Button
    lateinit var registerPageTitle: TextView
    @RequiresApi(Build.VERSION_CODES.N)
    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)
        binding = DataBindingUtil.setContentView(this, R.layout.activity_main)
        sharedPref = this.getSharedPreferences(
            getString(R.string.preferences_colorimage),
            Context.MODE_PRIVATE
        )
        sharedPrefEdit = sharedPref.edit()

        // set listeners on view buttons
        binding.joinChatButton.setOnClickListener { onJoinChatButtonClick() }
        binding.createYourAccountButton.setOnClickListener { onGoToRegisterActivityButtonClick() }
        languageManager = LanguageManager(this)
        registerPageTitle = findViewById(R.id.register_page_title)
        emailInput = findViewById(R.id.email_text_input_edit)
        passwordInput = findViewById(R.id.password_text_input_edit)
        connectionButton = findViewById(R.id.join_chat_button)
        createYourAccountButton = findViewById(R.id.create_your_account_button)
        parametersButton = findViewById(R.id.parameters)
        emailInputLayout = findViewById(R.id.email_text_input_layout)
        passwordInputLayout = findViewById(R.id.password_text_input_layout)

            updateFrench()


        parametersButton.setOnClickListener {
            val builder = AlertDialog.Builder(this)
            val inflater = layoutInflater
            val ad = builder.create()
            val dialogLayout = inflater.inflate(R.layout.settings, null)
            val languageTV = dialogLayout.findViewById<TextView>(R.id.language_tv)
            val themeTV = dialogLayout.findViewById<TextView>(R.id.theme_tv)
            val englishButton = dialogLayout.findViewById<Button>(R.id.english_button)
            val frenchButton = dialogLayout.findViewById<Button>(R.id.french_button)
            val light_blue = dialogLayout.findViewById<Button>(R.id.light_blue)
            val light_grey = dialogLayout.findViewById<Button>(R.id.light_grey)
            val light_pink = dialogLayout.findViewById<Button>(R.id.light_pink)
            val deep_purple = dialogLayout.findViewById<Button>(R.id.deep_purple)
            val dark_grey = dialogLayout.findViewById<Button>(R.id.dark_grey)
            frenchButton.text = getStr(R.string.french_button)
            englishButton.text = getStr(R.string.english_button)
            languageTV.text = getStr(R.string.language)
            themeTV.text = getStr(R.string.theme)

            frenchButton.setOnClickListener {
                runOnUiThread {
                    updateFrench()
                    frenchButton.text = getStr(R.string.french_button)
                    englishButton.text = getStr(R.string.english_button)
                    languageTV.text = getStr(R.string.language)
                    themeTV.text = getStr(R.string.theme)
                    ad.cancel()
                }

            }
            englishButton.setOnClickListener {
                runOnUiThread {
                    updateEnglish()
                    frenchButton.text = getStr(R.string.french_button)
                    englishButton.text = getStr(R.string.english_button)
                    languageTV.text = getStr(R.string.language)
                    themeTV.text = getStr(R.string.theme)
                    ad.cancel()
                }
            }
            light_blue.setOnClickListener {
                    writeSharedPrefInt("theme", R.style.Theme_LightBlue)
                    setTheme(R.style.Theme_LightBlue)
                    finish()
                    startActivity(Intent(this, javaClass))
                    overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
                    ad.cancel()
            }
            dark_grey.setOnClickListener {
                writeSharedPrefInt("theme", R.style.Theme_DarkGrey)
                setTheme(R.style.Theme_DarkGrey)
                finish()
                startActivity(Intent(this, javaClass))
                overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            }
            light_grey.setOnClickListener {
                writeSharedPrefInt("theme", R.style.Theme_Colorimage)
                setTheme(R.style.Theme_Colorimage)
                finish()
                startActivity(Intent(this, javaClass))
                overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            }
            deep_purple.setOnClickListener {
                writeSharedPrefInt("theme", R.style.Theme_DeepPurple)
                setTheme(R.style.Theme_DeepPurple)
                finish()
                startActivity(Intent(this, javaClass))
                overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            }
            light_pink.setOnClickListener {
                writeSharedPrefInt("theme", R.style.Theme_LightPink)
                setTheme(R.style.Theme_LightPink)
                finish()
                startActivity(Intent(this, javaClass))
                overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            }
            with(builder) {
                runOnUiThread {
                    setPositiveButton("OK"){ dialog, which -> }
                    setView(dialogLayout)
                    show()
                }
            }
        }

    }




    fun getStr(ref: Int): String = languageManager.localizedContext!!.getString(ref)

    @RequiresApi(Build.VERSION_CODES.N)
    fun updateFrench()  {
            languageManager!!.updateResource("fr")
            registerPageTitle.text = languageManager!!.localizedContext!!.getString(R.string.connection)
            emailInput.hint = languageManager!!.localizedContext!!.getString(R.string.email)
            emailInputLayout.hint = languageManager!!.localizedContext!!.getString(R.string.email)
            passwordInput.hint = languageManager!!.localizedContext!!.getString(R.string.password)
            passwordInputLayout.hint = languageManager!!.localizedContext!!.getString(R.string.password)
            connectionButton.text = languageManager!!.localizedContext!!.getString(R.string.login_button)
            createYourAccountButton.text = languageManager!!.localizedContext!!.getString(R.string.create_your_account)
            parametersButton.text = languageManager!!.localizedContext!!.getString(R.string.settings)
            languageManager!!.localizedContext!!.getString(R.string.french_button)
    }

    @RequiresApi(Build.VERSION_CODES.N)
    fun updateEnglish() {
            languageManager!!.updateResource("en")
            registerPageTitle.text = languageManager!!.localizedContext!!.getString(R.string.connection)
            emailInput.hint= languageManager!!.localizedContext!!.getString(R.string.email)
            emailInputLayout.hint = languageManager!!.localizedContext!!.getString(R.string.email)
            passwordInput.hint = languageManager!!.localizedContext!!.getString(R.string.password)
            passwordInputLayout.hint = languageManager!!.localizedContext!!.getString(R.string.password)
            connectionButton.text = languageManager!!.localizedContext!!.getString(R.string.login_button)
            createYourAccountButton.text = languageManager!!.localizedContext!!.getString(R.string.create_your_account)
            parametersButton.text = languageManager!!.localizedContext!!.getString(R.string.settings)
    }

    private fun onJoinChatButtonClick() {
        val intent = Intent(this, AlbumsActivity::class.java)
        runBlocking {
            launch {
                if (performLogin()) {
                    startActivity(intent)
                    overridePendingTransition(android.R.anim.slide_in_left, android.R.anim.slide_in_left)
                }
            }
        }
    }

    private fun onGoToRegisterActivityButtonClick() {
        val intent = Intent(this, RegisterActivity::class.java)
        startActivity(intent)
        overridePendingTransition(android.R.anim.slide_in_left, android.R.anim.slide_in_left)
    }

    private suspend fun performLogin(): Boolean {
        val emailIsValid = isEmailValid()
        val passwordIsValid = isPasswordValid()

        if (!emailIsValid || !passwordIsValid) return false

        val email = binding.emailTextInputEdit.text.toString().trim()
        val password = binding.passwordTextInputEdit.text.toString().trim()
        var errorMessage: String? = null

        // perform login request
        val loginRequest = LoginRequest(email, password)
        val loginResponse = sendLoginUserRequest(loginRequest)

        val responseMessage = loginResponse?.message
        val responseUserEmail = loginResponse?.user?.useremail
        val responseNickname = loginResponse?.user?.nickname
        val responseLastLoggedInDate = loginResponse?.user?.lastLoggedIn
        val responseLastLoggedOutDate = loginResponse?.user?.lastLoggedOut
        val responseFriendsList = loginResponse?.user?.friends
        val responseAvatar = loginResponse?.user?.avatar
        when (responseMessage) {
            RequestsResponses.SUCCESS -> {
                val music: MediaPlayer = MediaPlayer.create(this, R.raw.notif)
                music.start()
                writeSharedPref("useremail", responseUserEmail!!)
                writeSharedPref("nickname", responseNickname!!)
                writeSharedPref("lastLoggedIn", responseLastLoggedInDate!!)
                writeSharedPref("lastLoggedOut", responseLastLoggedOutDate!!)
                writeSharedPref("avatar", responseAvatar!!)
                writeToSharedPrefArray("friends", responseFriendsList!!.toCollection(ArrayList()))
                setSingletonSocket(responseUserEmail)
                establishConnection(User(responseUserEmail))
                val leaveDrawing = LeaveDrawingRequest(readSharedPref("useremail")!!)
                httpService.leaveDrawing(leaveDrawing)
                return true
            }
            RequestsResponses.USER_ALREADY_CONNECTED -> {
                errorMessage =
                    languageManager!!.localizedContext!!.getString(R.string.user_already_connected)
                onErrorClick()
            }

            RequestsResponses.PASSWORD_DOES_NOT_MATCH, RequestsResponses.USER_NOT_FOUND -> {
                onErrorClick()
                errorMessage =
                    languageManager!!.localizedContext!!.getString(R.string.invalid_credentials)
            }
        }

        // Show error message from the server on the inputs
        binding.emailTextInputLayout.apply { error = errorMessage }
        binding.passwordTextInputLayout.apply { error = errorMessage }

        return false
    }

    private fun isEmailValid(): Boolean {
        val email = binding.emailTextInputEdit.text.toString().trim()
        var errorMessage: String? = null



        val animation: Animation =  AnimationUtils.loadAnimation(
            this,
            R.anim.wobble
        )
        animation.repeatCount = 3
        if (email.isBlank()) {
            errorMessage = ErrorMessages.FIELD_CANT_BE_EMPTY
            emailInput.startAnimation(animation)
            emailInputLayout.startAnimation(animation)
        } else if (!Utils.isEmailFormatValid(email)) {
            errorMessage = ErrorMessages.INVALID_EMAIL_ADDRESS
            emailInput.startAnimation(animation)
            emailInputLayout.startAnimation(animation)
        }

        // show error message on the input
        binding.emailTextInputLayout.apply { error = errorMessage }

        return errorMessage == null
    }

    private fun isPasswordValid(): Boolean {
        val password = binding.passwordTextInputEdit.text.toString().trim()
        var errorMessage: String? = null


        val animation: Animation =  AnimationUtils.loadAnimation(
            this,
            R.anim.wobble
        )
        animation.repeatCount = 3

        if (password.isBlank()) {
            passwordInput.startAnimation(animation)
            passwordInputLayout.startAnimation(animation)
            errorMessage = ErrorMessages.FIELD_CANT_BE_EMPTY
            passwordInput.startAnimation(animation)
            passwordInputLayout.startAnimation(animation)
        }

        binding.passwordTextInputLayout.apply { error = errorMessage }
        return errorMessage == null
    }

    private suspend fun sendLoginUserRequest(loginRequest: LoginRequest): LoginResponse? {
        val loginResponse: LoginResponse? = httpService.login(loginRequest)
        return loginResponse
    }

    private fun writeSharedPref(key: String, value: String) {
        getSharedPreferences("myAppPrefs", Context.MODE_PRIVATE).edit().putString(key, value)
            .apply()
    }

    private fun writeSharedPrefInt(key: String, value: Int) {
        getSharedPreferences("myAppPrefs", Context.MODE_PRIVATE).edit().putInt(key, value)
            .apply()
    }

    private fun writeToSharedPrefArray(arrayName: String, array: ArrayList<String>) {
        setArrayPrefs(arrayName, array)
    }

    private fun onErrorClick() {
        val animation: Animation = AnimationUtils.loadAnimation(
            this,
            R.anim.wobble
        )
        animation.repeatCount = 3
        emailInput.startAnimation(animation)
        passwordInput.startAnimation(animation)
        emailInputLayout.startAnimation(animation)
        passwordInputLayout.startAnimation(animation)
        val music: MediaPlayer = MediaPlayer.create(this, R.raw.error)
        music.start()
    }
}