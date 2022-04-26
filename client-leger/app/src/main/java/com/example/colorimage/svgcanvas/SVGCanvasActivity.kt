package com.example.colorimage.svgcanvas


//import com.mocircle.cidrawing.utils.Point
import android.app.AlertDialog
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Path
import android.media.MediaPlayer
import android.os.Build
import android.os.Bundle
import android.preference.PreferenceManager
import android.util.DisplayMetrics
import android.util.Log
import android.view.MenuItem
import android.view.View
import android.view.ViewTreeObserver
import android.widget.ImageButton
import android.widget.PopupMenu
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.drawerlayout.widget.DrawerLayout
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.recyclerview.widget.RecyclerView.AdapterDataObserver
import com.example.colorimage.BaseActivity
import com.example.colorimage.R
import com.example.colorimage.SocketHandler
import com.example.colorimage.http.*
import com.example.colorimage.svgcanvas.LayerAdapter.OnRecyclerViewItemClickListener
import com.example.colorimage.svgcanvas.active_drawing_members.ActiveUsersListAdapter
import com.google.gson.Gson
import com.mocircle.android.logging.CircleLog
import com.mocircle.cidrawing.ConfigManager
import com.mocircle.cidrawing.DrawingBoard
import com.mocircle.cidrawing.DrawingBoardManager
import com.mocircle.cidrawing.board.Layer
import com.mocircle.cidrawing.element.PhotoElement
import com.mocircle.cidrawing.element.TextElement
import com.mocircle.cidrawing.element.shape.*
import com.mocircle.cidrawing.mode.*
import com.mocircle.cidrawing.mode.eraser.ObjectEraserMode
import com.mocircle.cidrawing.mode.selection.LassoSelectionMode
import com.mocircle.cidrawing.mode.selection.OvalSelectionMode
import com.mocircle.cidrawing.mode.selection.RectSelectionMode
import com.mocircle.cidrawing.mode.stroke.EraserStrokeMode
import com.mocircle.cidrawing.mode.stroke.PlainStrokeMode
import com.mocircle.cidrawing.mode.stroke.SmoothStrokeMode
import com.mocircle.cidrawing.operation.*
import com.mocircle.cidrawing.utils.*
import com.mocircle.cidrawing.utils.Point
import com.mocircle.cidrawing.view.CiDrawingView
import io.socket.client.Socket
import io.socket.emitter.Emitter
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.json.JSONException
import org.json.JSONObject
import java.io.*
import java.util.*


class SVGCanvasActivity : BaseActivity() {
    private var drawingView: CiDrawingView? = null
    private lateinit var drawer: DrawerLayout
    private var layersView: RecyclerView? = null
    private lateinit var drawingBoard: DrawingBoard
    private lateinit var activeUsersListAdapter: ActiveUsersListAdapter
    private var layerAdapter: LayerAdapter? = null
    var drawingName: String? = null
    var useremail: String? = null
    lateinit var socket: Socket
    var currentDrawingActiveMembers = mutableListOf<String>()
    var currentUserFriendsList = mutableListOf<String>()
    var smoothStrokeMode = SmoothStrokeMode()
    val insertShapeMode = InsertShapeMode()
    val pointerMode = PointerMode()

    private val gson: Gson = Gson()


    @RequiresApi(Build.VERSION_CODES.O)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_svgcanvas)
        setupView()
        setupLayerView()
        drawingBoard = DrawingBoardManager.getInstance().createDrawingBoard()
        setupDrawingBoard()
        drawingBoard.getElementManager().createNewLayer()
        drawingBoard.getElementManager().selectFirstVisibleLayer()
        drawingName = intent.getStringExtra("drawingName")
        val isPassword = intent.getBooleanExtra("password", false)
        useremail = readSharedPref("useremail")
        if (!isPassword) useremail = readSharedPref("useremail")
        sendJoinDrawingPostRequest(JoinDrawingRequest(useremail!!, drawingName!!))

        activeUsersListAdapter = ActiveUsersListAdapter(
            this,
            currentDrawingActiveMembers as ArrayList<String>,
            currentUserFriendsList as ArrayList<String>,
            useremail!!
        )
        //  init socket
        initSocket()
        setAddFriendSocketEventListener()

        val displayMetrics = DisplayMetrics()
        windowManager.defaultDisplay.getMetrics(displayMetrics)
        var width = displayMetrics.widthPixels
        var height = displayMetrics.heightPixels

        drawingView?.setSocket(socket)
        Log.i("WINDOW",width.toString() + "x" + height.toString())


        drawingBoard.drawingContext.setSocket(socket)

        runBlocking {
            launch {
                val drawingsList = httpService.getAllDrawings()
                val drawing = drawingsList!!.find { it.drawingName == drawingName}
                Log.i("xxxxx", drawing!!.toString())
                drawInitialLines(drawing!!)
            }
        }

        val x = findViewById<View>(R.id.drawing_view)
        val vto: ViewTreeObserver = x.getViewTreeObserver()
        vto.addOnGlobalLayoutListener(object : ViewTreeObserver.OnGlobalLayoutListener {
            override fun onGlobalLayout() {
                x.getViewTreeObserver().removeGlobalOnLayoutListener(this)
                val width: Int = x.getMeasuredWidth()
                val height: Int = x.getMeasuredHeight()
                Log.i("BOARD",width.toString() + "x" + height.toString())
            }
        })

    }

    override fun onBackPressed() {
        super.onBackPressed()
        runBlocking {
            launch {
                val x = LeaveDrawingRequest(useremail!!)
                Log.i("LEAVE_DRAWING", x.toString())
                val y = httpService.leaveDrawing(x)
                Log.i("LEAVE_DRAWING", y!!.message)
            }
        }

    }

    fun showActiveUserInCurrentDrawing(view: View?) {
        //Instantiate builder variable
        val builder = AlertDialog.Builder(view!!.context)

        // set title
        builder.setTitle(R.string.drawing_active_users_modal_title)

        runBlocking {
            launch {
                val drawingsList = httpService.getAllDrawings()
                val currentDrawing = drawingsList!!.find { it.drawingName == drawingName }
                if (!currentDrawing?.equals(null)!!) {
                    currentDrawingActiveMembers =
                        currentDrawing.members!!.toList() as MutableList<String>
                }
            }
        }

        activeUsersListAdapter = ActiveUsersListAdapter(
            this,
            currentDrawingActiveMembers.filter { it != useremail } as ArrayList<String>,
            currentUserFriendsList as ArrayList<String>,
            useremail!!
        )

        // set the custom layout
        builder.setAdapter(activeUsersListAdapter, null)
        val music: MediaPlayer = MediaPlayer.create(this, R.raw.ui2)
        music.start()
        builder.show()
    }

    private fun setAddFriendSocketEventListener() {
        socket.on("friends modified") {
            val jsonString = it[0].toString()
            val addFriendResponse =
                gson.fromJson(jsonString, SocketEventFriendModifiedResponse::class.java)

            if (addFriendResponse.user1.useremail.equals(useremail) || addFriendResponse.user2.equals(
                    useremail
                )
            ) {
                CircleLog.i("ON_ADD_FRIEND", addFriendResponse.toString())

                // update current drawing list
                val friendsList = getArrayPrefs("friends")
                if (addFriendResponse.user2.useremail !in friendsList) {
                    friendsList.add(addFriendResponse.user2.useremail)
                    setArrayPrefs("friends", friendsList)
                    currentUserFriendsList = friendsList;
                }
                runOnUiThread {
                    activeUsersListAdapter.notifyDataSetChanged()
                }
            }
        }


    }

    @RequiresApi(Build.VERSION_CODES.O)
    private fun drawInitialLines(drawing: Drawing) {

        runBlocking {
            launch {
//                val drawings = httpService.getAllDrawings()
//                val drawing = drawings!![18]
//
                if (drawing.elements.isNullOrEmpty()) {
                    return@launch
                }

                for (drawingElement in drawing.elements!!) {
                    when (drawingElement.type) {
                        "rectangle", "ellipse" -> {
                            val shape = convertBaseShapeToShapeObj(drawingElement)
                            insertShapeMode.drawSingleShape(shape)
                        }
                        else -> {
                            // line
                            if (!drawingElement.pointsList.isNullOrEmpty()) {
                                val line = convertBaseShapeToPencilObj(drawingElement)
                                smoothStrokeMode.drawSingleLine(line)
                            }
                        }
                    }
                }
            }
        }
    }

    private fun convertBaseShapeToPencilObj(baseShape: BaseShapeInterface): PencilObj {
        val pointsList: ArrayList<Point> = arrayListOf<Point>()
        baseShape.pointsList!!.forEach {

            pointsList.add(Point(it.x, it.y))
        }
        return PencilObj(
            baseShape.id,
            baseShape.user, pointsList.toTypedArray(),
            baseShape.strokeWidth!!,
            baseShape.fill,
            baseShape.stroke,
            baseShape.fillOpacity,
            baseShape.strokeOpacity
        )
    }

    private fun convertBaseShapeToShapeObj(baseShape: BaseShapeInterface): ShapeObj {
        return ShapeObj(
            baseShape.id,
            baseShape.user,
            baseShape.x?:0,
            baseShape.y?:0,
            baseShape.finalX?:0,
            baseShape.finalY?:0,
            baseShape.width?:0,
            baseShape.height?:0,
            baseShape.strokeWidth?:0,
            baseShape.fill,
            baseShape.stroke,
            baseShape.fillOpacity,
            baseShape.strokeOpacity,
            baseShape.type
        )
    }



    private fun sendJoinDrawingPostRequest(joinDrawingRequest: JoinDrawingRequest) {
        runBlocking {
            launch {
                Log.i("JOIN_DRAWING_REQUEST", joinDrawingRequest.toString())
                val joinRoomResponse: MessageResponse? =
                    httpService.joinDrawing(joinDrawingRequest)
                joinedDrawings.add(joinDrawingRequest.drawingName)
                Log.i("JOIN_DRAWING_REQUEST", joinRoomResponse.toString())
            }
        }
    }

    private fun initSocket() {
        socket = SocketHandler.getSingletonSocket()!!
        smoothStrokeMode.setDrawingBoardId(drawingBoard.boardId)
        insertShapeMode.setDrawingBoardId(drawingBoard.boardId)
        pointerMode.setDrawingBoardId(drawingBoard.boardId)

        socket.on("JOINDRAWING") {
            CircleLog.i("__JOIN_DRAWING", "DRAWING HAS BEEN JOINED")
        }

        socket.on(SocketDrawingEventType.START_LINE) {

            val jsonString = it[0].toString()
            val pencilObj = gson.fromJson(jsonString, PencilObj::class.java)

            CircleLog.i("ON_START_LINE", pencilObj.toString())
            smoothStrokeMode.onSocketEvent(
                SocketDrawingEvent(
                    pencilObj,
                    SocketDrawingEventType.START_LINE
                )
            )
            drawingView!!.notifyViewUpdated()
        }

        socket.on(SocketDrawingEventType.DRAW_LINE) {
            val jsonString = it[0].toString()
            val pointData = gson.fromJson(jsonString, PointData::class.java)
            CircleLog.i("ON_DRAW_LINE", pointData.toString())

            smoothStrokeMode.onSocketEvent(
                SocketDrawingEvent(
                    pointData.shapeId,
                    pointData.point,
                    SocketDrawingEventType.DRAW_LINE
                )
            )
            drawingView!!.notifyViewUpdated()
        }

        socket.on(SocketDrawingEventType.END_LINE) {
            val jsonString = it[0].toString()
            val pencilObj = gson.fromJson(jsonString, PencilObj::class.java)
            CircleLog.i("ON_END_LINE", pencilObj.toString())

            smoothStrokeMode.onSocketEvent(
                SocketDrawingEvent(
                    pencilObj,
                    SocketDrawingEventType.END_LINE
                )
            )
            drawingView!!.notifyViewUpdated()

        }

        socket.on(SocketDrawingEventType.START_RECTANGLE) {
            val jsonString = it[0].toString()
            val rectObj = gson.fromJson(jsonString, ShapeObj::class.java)
            val point = Point(rectObj.x, rectObj.y);
            CircleLog.i("ON_START_RECTANGLE", rectObj.toString())


            insertShapeMode.onSocketEvent(
                SocketDrawingEvent(
                    rectObj,
                    SocketDrawingEventType.START_SHAPE,
                    SupportedShapeType.RECTANGLE
                )
            )
            drawingView!!.notifyViewUpdated()

        }

        socket.on(SocketDrawingEventType.DRAW_RECTANGLE) {
            val jsonString = it[0].toString()
            val pointData = gson.fromJson(jsonString, PointData::class.java)
            CircleLog.i("ON_DRAW_RECTANGLE", pointData.toString())

            insertShapeMode.onSocketEvent(
                SocketDrawingEvent(
                    pointData.shapeId,
                    pointData.point,
                    SocketDrawingEventType.DRAW_SHAPE,
                    SupportedShapeType.RECTANGLE
                )
            )
            drawingView!!.notifyViewUpdated()
        }

        socket.on(SocketDrawingEventType.END_RECTANGLE) {
            val jsonString = it[0].toString()
            val rectObj = gson.fromJson(jsonString, ShapeObj::class.java)
            CircleLog.i("ON_END_RECTANGLE", rectObj.toString())

            insertShapeMode.onSocketEvent(
                SocketDrawingEvent(
                    rectObj,
                    SocketDrawingEventType.END_SHAPE,
                    SupportedShapeType.RECTANGLE
                )
            )
            drawingView!!.notifyViewUpdated()
        }

        socket.on(SocketDrawingEventType.START_OVAL) {

            val jsonString = it[0].toString()
            val ovalObj = gson.fromJson(jsonString, ShapeObj::class.java)

            insertShapeMode.onSocketEvent(
                SocketDrawingEvent(
                    ovalObj,
                    SocketDrawingEventType.START_SHAPE,
                    SupportedShapeType.ELLIPSE
                )
            )
            drawingView!!.notifyViewUpdated()
        }

        socket.on(SocketDrawingEventType.DRAW_OVAL) {
            val jsonString = it[0].toString()
            val pointData = gson.fromJson(jsonString, PointData::class.java)

            insertShapeMode.onSocketEvent(
                SocketDrawingEvent(
                    pointData.shapeId,
                    pointData.point,
                    SocketDrawingEventType.DRAW_SHAPE,
                    SupportedShapeType.ELLIPSE
                )
            )
            drawingView!!.notifyViewUpdated()
        }

        socket.on(SocketDrawingEventType.END_OVAL) {
            val jsonString = it[0].toString()
            val ovalObj = gson.fromJson(jsonString, ShapeObj::class.java)

            insertShapeMode.onSocketEvent(
                SocketDrawingEvent(
                    ovalObj,
                    SocketDrawingEventType.END_SHAPE,
                    SupportedShapeType.ELLIPSE
                )
            )
            drawingView!!.notifyViewUpdated()
        }

//        socket.on(SocketDrawingEventType.DOWN_SELECT) {
//            val jsonString = it[0].toString()
//            val selectObj = gson.fromJson(jsonString, SelectObj::class.java)
//
//            pointerMode.onSocketEvent(
//                SocketDrawingEvent(
//                    selectObj,
//                    SocketDrawingEventType.START_SELECTION,
//                )
//            )
////            Log.i("_DOWN_SELECT", selectObj.toString())
//            drawingView!!.notifyViewUpdated()
//        }

        socket.on(SocketDrawingEventType.START_SELECTION) {
            val jsonString = it[0].toString()
            val selectObj = gson.fromJson(jsonString, SelectObj::class.java)

            pointerMode.onSocketEvent(
                SocketDrawingEvent(
                    selectObj,
                    SocketDrawingEventType.START_SELECTION,
                )
            )
            CircleLog.i("_START_SELECT__________", selectObj.toString())
            drawingView!!.notifyViewUpdated()
        }

        socket.on(SocketDrawingEventType.DRAW_SELECTION) {
            val jsonString = it[0].toString()
            val selectObj = gson.fromJson(jsonString, SelectObj::class.java)

            pointerMode.onSocketEvent(
                SocketDrawingEvent(
                    selectObj,
                    SocketDrawingEventType.DRAW_SELECTION,
                )
            )
            CircleLog.i("_DRAW_SELECT__________", selectObj.toString())
            drawingView!!.notifyViewUpdated()
        }

        socket.on(SocketDrawingEventType.RESIZE_SELECTION) {
            val jsonString = it[0].toString()
            val selectObj = gson.fromJson(jsonString, SelectObj::class.java)

            pointerMode.onSocketEvent(
                SocketDrawingEvent(
                    selectObj,
                    SocketDrawingEventType.RESIZE_SELECTION,
                )
            )
//            Log.i("_RESIZE_SELECT", selectObj.toString())
            drawingView!!.notifyViewUpdated()
        }

        socket.on(SocketDrawingEventType.DELETE_SELECTION) {
            val jsonString = it[0].toString()
            val selectObj = gson.fromJson(jsonString, SelectObj::class.java)

            pointerMode.onSocketEvent(
                SocketDrawingEvent(
                    selectObj,
                    SocketDrawingEventType.DELETE_SELECTION,
                )
            )
            CircleLog.i("_DELETE_SELECT__________", selectObj.toString())
            drawingView!!.notifyViewUpdated()
        }

        socket.on(SocketDrawingEventType.RESET_DRAWING) {

            val music: MediaPlayer = MediaPlayer.create(this, R.raw.bin)
            music.start()
            drawingBoard!!.elementManager.clearAll()
            drawingView!!.notifyViewUpdated()
        }
    }

    private var onStartLine = Emitter.Listener {
        val jsonString = it[0].toString()
        val pencilObj = gson.fromJson(jsonString, PencilObj::class.java)
    }


    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            R.id.switch_drawing_type_menu -> {
                switchDrawingType()
                return true
            }
            R.id.switch_debug_menu -> {
                switchDebugMode()
                return true
            }
            R.id.show_info_menu -> {
                showInfo()
                return true
            }
            R.id.save_menu -> {
                saveDrawing()
                return true
            }
            R.id.load_menu -> {
                loadDrawing()
                return true
            }
            R.id.export_menu -> {
                exportPicture()
                return true
            }
        }
        return super.onOptionsItemSelected(item)
    }

    private fun setupView() {
//        val toolbar: Toolbar? = findViewById(R.id.toolbar) as Toolbar?
//        setSupportActionBar(toolbar)
//        drawer = (findViewById<DrawerLayout>(R.id.svgcanvas_drawer_layout))!!
//        val toggle = ActionBarDrawerToggle(
//            this, drawer, toolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close
//        )
//        drawer.setScrimColor(Color.TRANSPARENT)
//        drawer.setDrawerListener(toggle)
//        toggle.syncState()
    }

    private fun setupDrawingBoard() {
        drawingView = findViewById(R.id.drawing_view) as CiDrawingView?
        drawingBoard!!.setupDrawingView(drawingView)
        drawingBoard!!.drawingContext.paint.color = Color.BLUE
        drawingBoard!!.drawingContext.paint.secondaryColor = Color.RED
        drawingBoard!!.drawingContext.paint.style = Paint.Style.FILL_AND_STROKE
        drawingBoard!!.drawingContext.paint.strokeWidth = 6f
        drawingBoard!!.drawingContext.drawingMode = SmoothStrokeMode()
        layerAdapter!!.registerAdapterDataObserver(object : AdapterDataObserver() {
            override fun onChanged() {
                drawingBoard!!.drawingView.notifyViewUpdated()
            }
        })
        layerAdapter!!.setOnItemClick(object : OnRecyclerViewItemClickListener {
            override fun onItemClick(view: View?, layer: Layer?) {
                drawingBoard!!.elementManager.selectLayer(layer)
                layerAdapter!!.notifyDataSetChanged()
            }
        })
        drawingBoard!!.elementManager.addLayerChangeListener {
            layerAdapter!!.setLayers(
                Arrays.asList(
                    *drawingBoard!!.elementManager.layers
                )
            )
        }
    }

    private fun setupLayerView() {
        layersView = findViewById(R.id.layers_view) as RecyclerView?
        layersView!!.layoutManager = LinearLayoutManager(this)
        layerAdapter = LayerAdapter()
        layersView!!.adapter = layerAdapter
    }

    // First row
    fun pointer(v: View?) {
        drawingBoard!!.drawingContext.drawingMode = pointerMode
    }

    fun deleteSelect(v: View?) {
        socket.emit(SocketDrawingEventType.DELETE_SELECTION, gson.toJson(SelectObj(true)))
    }

    fun select(v: View?) {
        val popup = PopupMenu(this, v)
        popup.menuInflater.inflate(R.menu.svgcanvas_menu_select, popup.menu)
        popup.setOnMenuItemClickListener { item ->
            val mode = PointerMode()
            when (item.itemId) {
                R.id.rect_select_menu -> mode.setSelectionMode(RectSelectionMode())
                R.id.oval_select_menu -> mode.setSelectionMode(OvalSelectionMode())
                R.id.lasso_menu -> mode.setSelectionMode(LassoSelectionMode())
            }
            drawingBoard!!.drawingContext.drawingMode = mode
            true
        }
        popup.show()
    }


    // Second row
    fun stroke(v: View?) {
        val popup = PopupMenu(this, v)
        popup.menuInflater.inflate(R.menu.svgcanvas_menu_stroke, popup.menu)
        popup.setOnMenuItemClickListener { item ->
            var mode: DrawingMode? = null
            when (item.itemId) {
                R.id.plain_stroke_menu -> mode = PlainStrokeMode()
                R.id.smooth_stroke_menu -> mode = SmoothStrokeMode()
                R.id.eraser_stroke_menu -> mode = EraserStrokeMode()
            }
            if (mode != null) {
                drawingBoard!!.drawingContext.drawingMode = mode
            }
            true
        }
        popup.show()
    }

    fun strokePen(v: View?) {
        drawingBoard!!.drawingContext.drawingMode = PlainStrokeMode()
    }

    fun drawRectangle(v: View?) {
        val mode = InsertShapeMode()
//        if (drawingBoard!!.drawingContext.drawingMode )
//        drawingBoard!!.drawingContext.drawingMode = mode
//        CircleLog.i("MODE",drawingBoard!!.drawingContext.drawingMode.toString())
//        mode.setShapeType(RectElement::class.java)
        if (drawingBoard!!.drawingContext.drawingMode.toString() != insertShapeMode.toString()) {
            drawingBoard!!.drawingContext.drawingMode = insertShapeMode
        }

        insertShapeMode.setCurrentUserShapeType(SupportedShapeType.RECTANGLE)

    }

    fun drawOval(v: View?) {
//        val mode = InsertShapeMode()
        if (drawingBoard!!.drawingContext.drawingMode.toString() != insertShapeMode.toString()) {
            drawingBoard!!.drawingContext.drawingMode = insertShapeMode
        }
//        mode.setShapeType(OvalElement::class.java)

        insertShapeMode.setCurrentUserShapeType(SupportedShapeType.ELLIPSE)
    }

    fun clearAll(v: View?) {
//        drawingBoard!!.elementManager.clearAll();
//        drawingView!!.notifyViewUpdated()
        socket.emit(SocketDrawingEventType.RESET_DRAWING)
    }

    fun eraseObject(v: View?) {
        drawingBoard!!.drawingContext.drawingMode = ObjectEraserMode()
    }

    fun insertShape(v: View?) {
        val popup = PopupMenu(this, v)
        popup.menuInflater.inflate(R.menu.svgcanvas_menu_insert_shape, popup.menu)
        popup.setOnMenuItemClickListener { item ->
            val mode = InsertShapeMode()
            drawingBoard!!.drawingContext.drawingMode = mode
            when (item.itemId) {
                R.id.line_menu -> mode.setShapeType(LineElement::class.java)
                R.id.arc_menu -> mode.setShapeType(ArcElement::class.java)
                R.id.rect_menu -> mode.setShapeType(RectElement::class.java)
                R.id.squre_menu -> mode.setShapeType(SquareElement::class.java)
                R.id.oval_menu -> mode.setShapeType(OvalElement::class.java)
                R.id.circle_menu -> mode.setShapeType(CircleElement::class.java)
                R.id.isosceles_triangle_menu -> mode.setShapeType(IsoscelesTriangleElement::class.java)
                R.id.right_triangle_menu -> {
                    val shape = RightTriangleElement()
                    shape.isLeftRightAngle = true
                    mode.setShapeInstance(shape)
                }
            }
            true
        }
        popup.show()
    }

    fun insertPhoto(v: View?) {
        val mode = InsertPhotoMode()
        try {
            val bitmap = BitmapFactory.decodeStream(getAssets().open("sample.jpg"))
            val element = PhotoElement()
            element.bitmap = bitmap
            element.isLockAspectRatio = true
            mode.setPhotoElement(element)
        } catch (e: IOException) {
            e.printStackTrace()
        }
        drawingBoard!!.drawingContext.drawingMode = mode
    }

    fun insertText(v: View?) {
        val mode = InsertTextMode()
        val element = TextElement()
        element.text = "Sample text"
        element.textSize = 60f
        mode.setTextElement(element)
        drawingBoard!!.drawingContext.drawingMode = mode
    }

    // Left drawer panel
    fun addLayer(v: View?) {
        drawingBoard!!.elementManager.createNewLayer()
        layerAdapter!!.notifyDataSetChanged()
    }

    fun removeLayer(v: View?) {
        drawingBoard!!.elementManager.removeLayer(drawingBoard!!.elementManager.currentLayer)
        drawingBoard!!.elementManager.selectFirstVisibleLayer()
        layerAdapter!!.notifyDataSetChanged()
    }

    // Right drawer panel
    fun reshape(v: View?) {
        drawingBoard!!.operationManager.executeOperation(ReshapeOperation())
    }

    fun group(v: View?) {
        drawingBoard!!.operationManager.executeOperation(GroupElementOperation())
    }

    fun ungroup(v: View?) {
        drawingBoard!!.operationManager.executeOperation(UngroupElementOperation())
    }

    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    fun pathUnion(v: View?) {
        val operation = PathOperation()
        operation.pathOp = Path.Op.UNION
        drawingBoard!!.operationManager.executeOperation(operation)
    }

    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    fun pathIntersect(v: View?) {
        val operation = PathOperation()
        operation.pathOp = Path.Op.INTERSECT
        drawingBoard!!.operationManager.executeOperation(operation)
    }

    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    fun pathDifferent(v: View?) {
        val operation = PathOperation()
        operation.pathOp = Path.Op.DIFFERENCE
        drawingBoard!!.operationManager.executeOperation(operation)
    }

    @RequiresApi(api = Build.VERSION_CODES.KITKAT)
    fun pathXor(v: View?) {
        val operation = PathOperation()
        operation.pathOp = Path.Op.XOR
        drawingBoard!!.operationManager.executeOperation(operation)
    }

    fun alignLeft(v: View?) {
        val operation = AlignmentOperation()
        operation.alignmentType = AlignmentOperation.AlignmentType.HorizontalLeft
        drawingBoard!!.operationManager.executeOperation(operation)
    }

    fun alignCenter(v: View?) {
        val operation = AlignmentOperation()
        operation.alignmentType = AlignmentOperation.AlignmentType.HorizontalCenter
        drawingBoard!!.operationManager.executeOperation(operation)
    }

    fun alignRight(v: View?) {
        val operation = AlignmentOperation()
        operation.alignmentType = AlignmentOperation.AlignmentType.HorizontalRight
        drawingBoard!!.operationManager.executeOperation(operation)
    }

    fun alignTop(v: View?) {
        val operation = AlignmentOperation()
        operation.alignmentType = AlignmentOperation.AlignmentType.VerticalTop
        drawingBoard!!.operationManager.executeOperation(operation)
    }

    fun alignMiddle(v: View?) {
        val operation = AlignmentOperation()
        operation.alignmentType = AlignmentOperation.AlignmentType.VerticalMiddle
        drawingBoard!!.operationManager.executeOperation(operation)
    }

    fun alignBottom(v: View?) {
        val operation = AlignmentOperation()
        operation.alignmentType = AlignmentOperation.AlignmentType.VerticalBottom
        drawingBoard!!.operationManager.executeOperation(operation)
    }

    fun flipVertical(v: View?) {
        val operation = FlipOperation()
        operation.flipType = FlipOperation.FlipType.Vertical
        drawingBoard!!.operationManager.executeOperation(operation)
    }

    fun flipHorizontal(v: View?) {
        val operation = FlipOperation()
        operation.flipType = FlipOperation.FlipType.Horizontal
        drawingBoard!!.operationManager.executeOperation(operation)
    }

    // Bottom row
    fun changeColor(v: View?) {
        val popup = PopupMenu(this, v)
        popup.menuInflater.inflate(R.menu.svgcanvas_menu_color, popup.menu)
        popup.setOnMenuItemClickListener { item ->
            when (item.itemId) {
                R.id.black_menu -> {
                    drawingBoard!!.drawingContext.paint.color =
                        Color.BLACK
                    findViewById<ImageButton>(R.id.primary_color_button).setBackgroundColor(Color.BLACK)
                }
                R.id.blue_menu -> {
                    findViewById<ImageButton>(R.id.primary_color_button).setBackgroundColor(Color.BLUE)
                    drawingBoard!!.drawingContext.paint.color =
                        Color.BLUE
                }
                R.id.red_menu -> {
                    findViewById<ImageButton>(R.id.primary_color_button).setBackgroundColor(Color.RED)
                    drawingBoard!!.drawingContext.paint.color =
                        Color.RED
                }
            }
            true
        }
        popup.show()
    }

    fun changeColor2(v: View?) {
        val popup = PopupMenu(this, v)
        popup.menuInflater.inflate(R.menu.svgcanvas_menu_color2, popup.menu)
        popup.setOnMenuItemClickListener { item ->
            when (item.itemId) {
//                R.id.nocolor_menu -> drawingBoard!!.drawingContext.paint.secondaryColor =
//                    null
                R.id.black_menu -> {
                    findViewById<ImageButton>(R.id.secondary_color_button).setBackgroundColor(Color.BLACK)
                    drawingBoard!!.drawingContext.paint.secondaryColor =
                        Color.BLACK
                }
                R.id.blue_menu -> {
                    findViewById<ImageButton>(R.id.secondary_color_button).setBackgroundColor(Color.BLUE)
                    drawingBoard!!.drawingContext.paint.secondaryColor =
                        Color.BLUE
                }
                R.id.red_menu -> {
                    findViewById<ImageButton>(R.id.secondary_color_button).setBackgroundColor(Color.RED)
                    drawingBoard!!.drawingContext.paint.secondaryColor =
                        Color.RED
                }
            }
            true
        }
        popup.show()
    }

    fun changeWidth(v: View?) {
        val popup = PopupMenu(this, v)
        popup.menuInflater.inflate(R.menu.svgcanvas_menu_width, popup.menu)
        popup.setOnMenuItemClickListener { item ->
            when (item.itemId) {
                R.id.large_menu -> drawingBoard!!.drawingContext.paint.strokeWidth =
                    10f
                R.id.normal_menu -> drawingBoard!!.drawingContext.paint.strokeWidth = 6f
                R.id.small_menu -> drawingBoard!!.drawingContext.paint.strokeWidth = 2f
            }
            true
        }
        popup.show()
    }

    fun changeStyle(v: View?) {
        val popup = PopupMenu(this, v)
        popup.menuInflater.inflate(R.menu.svgcanvas_menu_style, popup.menu)
        popup.setOnMenuItemClickListener { item ->
            when (item.itemId) {
                R.id.stroke_menu -> drawingBoard!!.drawingContext.paint.style =
                    Paint.Style.STROKE
                R.id.fill_menu -> drawingBoard!!.drawingContext.paint.style =
                    Paint.Style.FILL
                R.id.fill_stroke_menu -> drawingBoard!!.drawingContext.paint.style =
                    Paint.Style.FILL_AND_STROKE
            }
            true
        }
        popup.show()
    }

    fun undo(v: View?) {
        drawingBoard!!.operationManager.undo()
    }

    fun redo(v: View?) {
        drawingBoard!!.operationManager.redo()
    }

    fun arrange(v: View?) {
        val popup = PopupMenu(this, v)
        popup.menuInflater.inflate(R.menu.svgcanvas_menu_arrange, popup.menu)
        popup.setOnMenuItemClickListener(PopupMenu.OnMenuItemClickListener { item ->
            if (item.itemId == R.id.get_order_menu) {
                val element = drawingBoard!!.elementManager.selection.singleElement
                if (element != null) {
                    val index = drawingBoard!!.elementManager.currentLayer.getElementOrder(element)
                    Toast.makeText(
                        this,
                        "Element order = $index", Toast.LENGTH_SHORT
                    ).show()
                } else {
                    Toast.makeText(
                        this,
                        "You should select one element",
                        Toast.LENGTH_SHORT
                    ).show()
                }
                return@OnMenuItemClickListener true
            }
            val operation = ArrangeOperation()
            when (item.itemId) {
                R.id.bring_forward_menu -> operation.arrangeType =
                    ArrangeOperation.ArrangeType.BringForward
                R.id.bring_front_menu -> operation.arrangeType =
                    ArrangeOperation.ArrangeType.BringToFront
                R.id.send_backward_menu -> operation.arrangeType =
                    ArrangeOperation.ArrangeType.SendBackward
                R.id.send_back_menu -> operation.arrangeType =
                    ArrangeOperation.ArrangeType.SendToBack
            }
            drawingBoard!!.operationManager.executeOperation(operation)
            true
        })
        popup.show()
    }

    // More menu
    fun switchDrawingType() {
        if (drawingBoard!!.configManager.drawingType == ConfigManager.DrawingType.Vector) {
            drawingBoard!!.configManager.drawingType = ConfigManager.DrawingType.Painting
            Toast.makeText(this, "Switch to Painting type.", Toast.LENGTH_SHORT).show()
        } else {
            drawingBoard!!.configManager.drawingType = ConfigManager.DrawingType.Vector
            Toast.makeText(this, "Switch to Vector type.", Toast.LENGTH_SHORT).show()
        }
    }

    fun switchDebugMode() {
        drawingBoard!!.configManager.isDebugMode = !drawingBoard!!.configManager.isDebugMode
        drawingView!!.notifyViewUpdated()
        Toast.makeText(
            this,
            "Debug mode=" + drawingBoard!!.configManager.isDebugMode + ".",
            Toast.LENGTH_SHORT
        ).show()
    }

    fun showInfo() {
        val element = drawingBoard!!.elementManager.selection.singleElement
        if (element != null) {
            val msg = "Type: " + element.javaClass.simpleName
            Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
        }
    }

    fun saveDrawing() {
        val data = drawingBoard!!.exportData()
        val editor = PreferenceManager.getDefaultSharedPreferences(this).edit()
        editor.putString("drawings", data.metaData.toString())
        editor.commit()
        val resMap = data.resources
        for (key in resMap.keys) {
            val file: File = File(this.getExternalCacheDir(), key)
            try {
                val fos = FileOutputStream(file)
                fos.write(resMap[key])
                fos.flush()
                fos.close()
            } catch (e: FileNotFoundException) {
                e.printStackTrace()
            } catch (e: IOException) {
                e.printStackTrace()
            }
        }
        Log.i(TAG, "Save drawing as: " + data.metaData.toString())
        Toast.makeText(this, "Drawing saved.", Toast.LENGTH_SHORT).show()
    }

    fun loadDrawing() {
        val drawings = PreferenceManager.getDefaultSharedPreferences(this).getString("drawings", "")
        val resources: MutableMap<String, ByteArray> = HashMap()
        try {
            val files: Array<File> = this.getExternalCacheDir()!!.listFiles()
            for (file in files) {
                try {
                    val fis = RandomAccessFile(file, "r")
                    val bs = ByteArray(fis.length().toInt())
                    fis.readFully(bs)
                    fis.close()
                    resources[file.name] = bs
                } catch (e: FileNotFoundException) {
                    e.printStackTrace()
                } catch (e: IOException) {
                    e.printStackTrace()
                }
            }
            val obj = JSONObject(drawings)
            drawingBoard = DrawingBoardManager.getInstance().createDrawingBoard(obj)
            setupDrawingBoard()
            drawingBoard.importData(obj, resources)
            drawingBoard.getElementManager().selectFirstVisibleLayer()
            Toast.makeText(this, "Drawing loaded.", Toast.LENGTH_SHORT).show()
        } catch (e: JSONException) {
            Log.e(TAG, e.message, e)
            Toast.makeText(this, "Load drawing failed.", Toast.LENGTH_SHORT).show()
        }
    }

    fun exportPicture() {
        //TODO task
    }

    companion object {
        private const val TAG = "MainActivity"
    }
}